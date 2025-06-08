package com.compresser.compresser.service;

import java.io.*;
import java.util.*;

public class HuffmanCompressor {
    private static class HuffmanNode implements Comparable<HuffmanNode> {
        byte value;
        int frequency;
        HuffmanNode left;
        HuffmanNode right;

        HuffmanNode(byte value, int frequency) {
            this.value = value;
            this.frequency = frequency;
        }

        @Override
        public int compareTo(HuffmanNode other) {
            return this.frequency - other.frequency;
        }
    }

    public byte[] compress(byte[] data) throws IOException {
        // Calculate frequency of each byte
        Map<Byte, Integer> frequencyMap = new HashMap<>();
        for (byte b : data) {
            frequencyMap.merge(b, 1, Integer::sum);
        }

        // Build Huffman tree
        PriorityQueue<HuffmanNode> pq = new PriorityQueue<>();
        for (Map.Entry<Byte, Integer> entry : frequencyMap.entrySet()) {
            pq.add(new HuffmanNode(entry.getKey(), entry.getValue()));
        }

        while (pq.size() > 1) {
            HuffmanNode left = pq.poll();
            HuffmanNode right = pq.poll();
            HuffmanNode parent = new HuffmanNode((byte) 0, left.frequency + right.frequency);
            parent.left = left;
            parent.right = right;
            pq.add(parent);
        }

        // Generate Huffman codes
        Map<Byte, String> huffmanCodes = new HashMap<>();
        generateCodes(pq.peek(), "", huffmanCodes);

        // Write frequency table and compressed data
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        DataOutputStream dos = new DataOutputStream(baos);

        // Write frequency table size
        dos.writeInt(frequencyMap.size());
        
        // Write frequency table
        for (Map.Entry<Byte, Integer> entry : frequencyMap.entrySet()) {
            dos.writeByte(entry.getKey());
            dos.writeInt(entry.getValue());
        }

        // Write compressed data
        StringBuilder compressedBits = new StringBuilder();
        for (byte b : data) {
            compressedBits.append(huffmanCodes.get(b));
        }

        // Pad the bits to make them divisible by 8
        while (compressedBits.length() % 8 != 0) {
            compressedBits.append("0");
        }

        // Write the number of padding bits
        dos.writeInt(compressedBits.length() % 8);

        // Write the compressed data
        for (int i = 0; i < compressedBits.length(); i += 8) {
            String byteStr = compressedBits.substring(i, i + 8);
            dos.writeByte((byte) Integer.parseInt(byteStr, 2));
        }

        return baos.toByteArray();
    }

    public byte[] decompress(byte[] compressedData) throws IOException {
        DataInputStream dis = new DataInputStream(new ByteArrayInputStream(compressedData));

        // Read frequency table
        int tableSize = dis.readInt();
        Map<Byte, Integer> frequencyMap = new HashMap<>();
        for (int i = 0; i < tableSize; i++) {
            byte value = dis.readByte();
            int frequency = dis.readInt();
            frequencyMap.put(value, frequency);
        }

        // Rebuild Huffman tree
        PriorityQueue<HuffmanNode> pq = new PriorityQueue<>();
        for (Map.Entry<Byte, Integer> entry : frequencyMap.entrySet()) {
            pq.add(new HuffmanNode(entry.getKey(), entry.getValue()));
        }

        while (pq.size() > 1) {
            HuffmanNode left = pq.poll();
            HuffmanNode right = pq.poll();
            HuffmanNode parent = new HuffmanNode((byte) 0, left.frequency + right.frequency);
            parent.left = left;
            parent.right = right;
            pq.add(parent);
        }

        // Read padding bits
        int paddingBits = dis.readInt();

        // Read compressed data
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        HuffmanNode root = pq.peek();
        HuffmanNode current = root;

        while (dis.available() > 0) {
            byte b = dis.readByte();
            String bits = String.format("%8s", Integer.toBinaryString(b & 0xFF)).replace(' ', '0');
            
            for (int i = 0; i < bits.length(); i++) {
                if (bits.charAt(i) == '0') {
                    current = current.left;
                } else {
                    current = current.right;
                }

                if (current.left == null && current.right == null) {
                    baos.write(current.value);
                    current = root;
                }
            }
        }

        return baos.toByteArray();
    }

    private void generateCodes(HuffmanNode node, String code, Map<Byte, String> huffmanCodes) {
        if (node == null) return;
        if (node.left == null && node.right == null) {
            huffmanCodes.put(node.value, code);
        }
        generateCodes(node.left, code + "0", huffmanCodes);
        generateCodes(node.right, code + "1", huffmanCodes);
    }
} 