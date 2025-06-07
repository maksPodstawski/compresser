package com.compresser.compresser.service;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.*;
import java.nio.ByteBuffer;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.Future;
import java.util.zip.GZIPInputStream;
import java.util.zip.GZIPOutputStream;

@Service
public class CompressionService {

    private final ExecutorService executor = Executors.newFixedThreadPool(Runtime.getRuntime().availableProcessors());


    public Path compress(MultipartFile file) throws IOException {
        InputStream inputStream = file.getInputStream();
        String originalFilename = file.getOriginalFilename();
        if (originalFilename == null) {
            originalFilename = "compressed-file";
        }
        Path outputPath = Path.of(originalFilename + ".compressed");

        try (OutputStream outputStream = Files.newOutputStream(outputPath)) {
            byte[] filenameBytes = originalFilename.getBytes();
            outputStream.write(ByteBuffer.allocate(4).putInt(filenameBytes.length).array());
            outputStream.write(filenameBytes);

            byte[] buffer = new byte[1024 * 1024];
            int bytesRead;
            List<Future<byte[]>> futures = new ArrayList<>();

            while ((bytesRead = inputStream.read(buffer)) != -1) {
                byte[] block = Arrays.copyOf(buffer, bytesRead);
                futures.add(executor.submit(() -> compressChunk(block)));
            }

            for (Future<byte[]> future : futures) {
                byte[] compressed = future.get();
                outputStream.write(ByteBuffer.allocate(4).putInt(compressed.length).array());
                outputStream.write(compressed);
            }

        } catch (Exception e) {
            throw new IOException("Compression failed", e);
        }

        return outputPath;
    }

    public Path decompress(MultipartFile file) throws IOException {
        InputStream inputStream = file.getInputStream();

        byte[] filenameHeader = inputStream.readNBytes(4);
        int filenameLength = ByteBuffer.wrap(filenameHeader).getInt();
        String originalFilename = "";
        if (filenameLength > 0) {
            byte[] filenameBytes = inputStream.readNBytes(filenameLength);
            originalFilename = new String(filenameBytes);
        }

        Path outputPath = Path.of(originalFilename);

        try (OutputStream outputStream = Files.newOutputStream(outputPath)) {
            List<Future<byte[]>> futures = new ArrayList<>();

            while (true) {
                byte[] chunkHeader = inputStream.readNBytes(4);
                if (chunkHeader.length < 4) break;

                int chunkSize = ByteBuffer.wrap(chunkHeader).getInt();
                byte[] chunk = inputStream.readNBytes(chunkSize);
                if (chunk.length < chunkSize) break;

                futures.add(executor.submit(() -> decompressChunk(chunk)));
            }

            for (Future<byte[]> future : futures) {
                outputStream.write(future.get());
            }

        } catch (Exception e) {
            throw new IOException("Decompression failed", e);
        }

        return outputPath;
    }


    private byte[] compressChunk(byte[] data) throws IOException {
        try (ByteArrayOutputStream baos = new ByteArrayOutputStream();
             GZIPOutputStream gzip = new GZIPOutputStream(baos)) {
            gzip.write(data);
            gzip.finish();
            return baos.toByteArray();
        }
    }

    private byte[] decompressChunk(byte[] chunk) throws IOException {
        try (ByteArrayInputStream bais = new ByteArrayInputStream(chunk);
             GZIPInputStream gzip = new GZIPInputStream(bais);
             ByteArrayOutputStream baos = new ByteArrayOutputStream()) {
            byte[] buffer = new byte[8192];
            int len;
            while ((len = gzip.read(buffer)) > 0) {
                baos.write(buffer, 0, len);
            }
            return baos.toByteArray();
        }
    }
}
