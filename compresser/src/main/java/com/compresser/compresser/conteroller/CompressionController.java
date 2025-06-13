package com.compresser.compresser.conteroller;

import com.compresser.compresser.service.CompressionService;
import com.compresser.compresser.service.CompressionService.CompressionAlgorithm;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.FileSystemResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.TimeUnit;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/api")
public class CompressionController {

    private final CompressionService compressionService;
    private final ScheduledExecutorService scheduler = Executors.newScheduledThreadPool(1);
    private static final Path FILES_DIR = Paths.get("files");

    public CompressionController(CompressionService compressionService) {
        this.compressionService = compressionService;
        createFilesDirectory();
    }

    private void createFilesDirectory() {
        try {
            if (!Files.exists(FILES_DIR)) {
                Files.createDirectory(FILES_DIR);
            }
        } catch (IOException e) {
            throw new RuntimeException("Failed to create files directory", e);
        }
    }

    @PostMapping("/compress")
    public ResponseEntity<FileSystemResource> compress(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "algorithm", defaultValue = "GZIP") String algorithm) throws IOException {
        CompressionAlgorithm compressionAlgorithm;
        try {
            compressionAlgorithm = CompressionAlgorithm.valueOf(algorithm.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Invalid compression algorithm. Supported algorithms are: GZIP, HUFFMAN");
        }
        
        Path path = compressionService.compress(file, compressionAlgorithm);
        Path targetPath = FILES_DIR.resolve(path.getFileName());
        Files.move(path, targetPath);
        return prepareResponse(targetPath);
    }

    @PostMapping("/decompress")
    public ResponseEntity<FileSystemResource> decompress(@RequestParam("file") MultipartFile file) throws IOException {
        Path path = compressionService.decompress(file);
        Path targetPath = FILES_DIR.resolve(path.getFileName());
        Files.move(path, targetPath);
        return prepareResponse(targetPath);
    }

    private ResponseEntity<FileSystemResource> prepareResponse(Path file) throws IOException {
        FileSystemResource resource = new FileSystemResource(file.toFile());
        String filename = file.getFileName().toString();

        scheduler.schedule(() -> {
            try {
                Files.deleteIfExists(file);
            } catch (IOException e) {
                System.err.println("Failed to delete file: " + file);
            }
        }, 1, TimeUnit.MINUTES);

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                .contentType(MediaType.APPLICATION_OCTET_STREAM)
                .contentLength(resource.contentLength())
                .body(resource);
    }
}
