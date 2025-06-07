package com.compresser.compresser.conteroller;

import com.compresser.compresser.service.CompressionService;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.FileSystemResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Path;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class CompressionController {

    private final CompressionService compressionService;

    @PostMapping("/compress")
    public ResponseEntity<FileSystemResource> compress(@RequestParam("file") MultipartFile file) throws IOException {
        Path path = compressionService.compress(file);
        return prepareResponse(path);
    }

    @PostMapping("/decompress")
    public ResponseEntity<FileSystemResource> decompress(@RequestParam("file") MultipartFile file) throws IOException {
        Path path = compressionService.decompress(file);
        return prepareResponse(path);
    }

    private ResponseEntity<FileSystemResource> prepareResponse(Path file) throws IOException {
        FileSystemResource resource = new FileSystemResource(file.toFile());
        String filename = file.getFileName().toString();

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                .contentType(MediaType.APPLICATION_OCTET_STREAM)
                .contentLength(resource.contentLength())
                .body(resource);
    }
}
