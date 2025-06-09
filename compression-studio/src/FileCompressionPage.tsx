import type React from "react"
import { useState, useRef } from "react"
import { Button } from "./components/Button"
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from "./components/Card"
import { Label } from "./components/Label"
import { Progress } from "./components/Progress"
import { Alert, AlertDescription } from "./components/Alert"
import { Download, Upload, FileText, Zap, Settings, TreePine, Archive, FolderOpen, TrendingUp, CheckCircle, XCircle, Loader2} from "lucide-react"


export default function FileCompressionPage() {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [compressionMethod, setCompressionMethod] = useState<"huffman" | "gzip">("huffman");
    const [isProcessing, setIsProcessing] = useState(false);
    const [result, setResult] = useState<{
        type: "compress" | "decompress"
        originalSize: number
        processedSize: number
        compressionRatio: number
        filename: string
    } | null>(null);
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            setSelectedFile(file);
            setResult(null);
            setError(null);
        }
    }

    const formatFileSize = (bytes: number): string => {
        if (bytes === 0) return "0 Bytes";
        const k = 1024;
        const sizes = ["Bytes", "KB", "MB", "GB"];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
    }

    const [resultBlob, setResultBlob] = useState<Blob | null>(null);

    const handleCompress = async () => {
        if (!selectedFile) return;
        setIsProcessing(true);
        setError(null);

        const formData = new FormData();
        formData.append("file", selectedFile);
        formData.append("algorithm", compressionMethod.toUpperCase());

        try {
            const response = await fetch("/api/compress", {
                method: "POST",
                body: formData,
            });

            if (!response.ok) throw new Error("Compression failed");

            const blob = await response.blob();
            const processedSize = blob.size;
            const originalSize = selectedFile.size;
            const savedBytes = originalSize - processedSize;
            const compressionRatio = originalSize > 0 ? (savedBytes / originalSize) * 100 : 0;

            setResult({
                type: "compress",
                originalSize,
                processedSize,
                compressionRatio,
                filename: selectedFile.name + ".compressed",
            });

            setResultBlob(blob);
        } catch (e: any) {
            setError(e.message);
        } finally {
            setIsProcessing(false);
        }
    };

    const handleDecompress = async () => {
        if (!selectedFile) return;
        setIsProcessing(true);
        setError(null);

        const formData = new FormData();
        formData.append("file", selectedFile);

        try {
            const response = await fetch("/api/decompress", {
                method: "POST",
                body: formData,
            });

            if (!response.ok) throw new Error("Decompression failed");

            const blob = await response.blob();
            const processedSize = blob.size;
            const originalSize = selectedFile.size;
            const savedBytes = originalSize - processedSize;
            const compressionRatio = originalSize > 0 ? (savedBytes / originalSize) * 100 : 0;

            setResult({
                type: "decompress",
                originalSize,
                processedSize,
                compressionRatio,
                filename: selectedFile.name.replace(".compressed", ""),
            });
            setResultBlob(blob);
        } catch (e: any) {
            setError(e.message);
        } finally {
            setIsProcessing(false);
        }
    };

    const downloadResult = () => {
        if (!result || !resultBlob) return;
        const url = window.URL.createObjectURL(resultBlob);
        const a = document.createElement("a");
        a.href = url;
        a.download = result.filename;
        a.click();
        window.URL.revokeObjectURL(url);
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
            <div className="container mx-auto p-6 max-w-4xl">
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-purple-400 to-orange-400 bg-clip-text text-transparent flex items-center justify-center gap-3">
                        <Zap className="w-10 h-10 text-orange-400"/>
                        File Compression Studio
                    </h1>
                    <p className="text-slate-300">
                        Compress and decompress files using Huffman coding or Gzip algorithms
                    </p>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-purple-300">
                                <Settings className="w-5 h-5 text-orange-400" />
                                Configuration
                            </CardTitle>
                            <CardDescription>Choose your compression method and select a file</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">

                            <div className="space-y-3">
                                <Label className="text-base font-medium text-slate-200">Compression Method</Label>
                                <div className="grid grid-cols-1 gap-4">

                                    <label
                                        htmlFor="huffman"
                                        className="flex cursor-pointer items-start gap-4 border border-purple-500/30 bg-purple-900/20 rounded-lg p-4 hover:bg-purple-900/30 transition-colors"
                                    >
                                        <input
                                            type="radio"
                                            id="huffman"
                                            name="compressionMethod"
                                            value="huffman"
                                            checked={compressionMethod === "huffman"}
                                            onChange={() => setCompressionMethod("huffman")}
                                            className="mt-1 h-3 w-3 shrink-0 rounded-full border-2 border-purple-500 appearance-none cursor-pointer transition checked:bg-purple-500 checked:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-400"
                                        />
                                        <div className="grid gap-1.5 leading-tight">
                                            <div className="font-medium text-purple-200 flex items-center gap-2">
                                                <TreePine className="w-4 h-4"/>
                                                Huffman Coding
                                            </div>
                                            <p className="text-sm text-slate-400">
                                                Lossless compression algorithm based on character frequency
                                            </p>
                                        </div>
                                    </label>

                                    <label
                                        htmlFor="gzip"
                                        className="flex cursor-pointer items-start gap-4 border border-orange-500/30 bg-orange-900/20 rounded-lg p-4 hover:bg-orange-900/30 transition-colors"
                                    >
                                        <input
                                            type="radio"
                                            id="gzip"
                                            name="compressionMethod"
                                            value="gzip"
                                            checked={compressionMethod === "gzip"}
                                            onChange={() => setCompressionMethod("gzip")}
                                            className="mt-1 h-3 w-3 shrink-0 rounded-full border-2 border-orange-500 appearance-none cursor-pointer transition checked:bg-orange-500 checked:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-400"
                                        />
                                        <div className="grid gap-1.5 leading-tight">
                                            <div className="font-medium text-orange-200 flex items-center gap-2">
                                                <Archive className="w-4 h-4"/>
                                                Gzip
                                            </div>
                                            <p className="text-sm text-slate-400">
                                                Industry-standard compression using DEFLATE algorithm
                                            </p>
                                        </div>
                                    </label>

                                </div>
                            </div>

                            <div className="space-y-3">
                                <Label htmlFor="file-input" className="text-base font-medium text-slate-200">
                                    Select File
                                </Label>
                                <div
                                    className="border-2 border-dashed border-slate-600 bg-slate-800/30 rounded-lg p-6 text-center hover:border-purple-500/50 transition-colors">
                                    <input
                                        id="file-input"
                                        type="file"
                                        ref={fileInputRef}
                                        onChange={handleFileSelect}
                                        className="hidden"
                                    />
                                    <Button
                                        variant="outline"
                                        onClick={() => fileInputRef.current?.click()}
                                        className="flex items-center justify-center mx-auto mb-2 border-slate-600 bg-slate-700/50 text-slate-200 hover:bg-purple-600/20 hover:border-purple-500"
                                    >
                                        <FolderOpen className="w-4 h-4 mr-2"/>
                                        Choose File
                                    </Button>

                                    {selectedFile ? (
                                        <div className="text-sm">
                                            <p className="font-medium text-slate-200 flex items-center justify-center gap-2">
                                                <FileText className="w-4 h-4"/>
                                                {selectedFile.name}
                                            </p>
                                            <p className="text-slate-400">{formatFileSize(selectedFile.size)}</p>
                                        </div>
                                    ) : (
                                        <p className="text-sm text-slate-400">No file selected</p>
                                    )}
                                </div>
                            </div>

                            <div className="flex gap-3 justify-center">
                                <Button
                                    onClick={handleCompress}
                                    disabled={!selectedFile || isProcessing}
                                    className="flex flex-1 items-center justify-center bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white border-0"
                                >
                                    <Archive className="w-4 h-4 mr-2"/>
                                    Compress
                                </Button>
                                <Button
                                    onClick={handleDecompress}
                                    disabled={!selectedFile || isProcessing}
                                    className="flex flex-1 items-center justify-center bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800 text-white border-0"
                                >
                                    <Upload className="w-4 h-4 mr-2"/>
                                    Decompress
                                </Button>
                            </div>


                            {isProcessing && (
                                <div className="flex items-center gap-2 text-sm text-slate-300">
                                    <Loader2 className="w-4 h-4 animate-spin"/>
                                    Processing...
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-orange-300">
                                <TrendingUp className="w-5 h-5 text-purple-400"/>
                                Results
                            </CardTitle>
                            <CardDescription>Compression statistics and download</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {error && (
                                <Alert variant="destructive" className="mb-4">
                                    <AlertDescription className="flex items-center gap-2">
                                        <XCircle className="w-4 h-4"/>
                                        {error}
                                    </AlertDescription>
                                </Alert>
                            )}

                            {result ? (
                                <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                        <div className="space-y-2 bg-slate-700/30 rounded-lg p-4">
                                            <p className="font-medium text-slate-300 flex items-center gap-2">
                                                <FileText className="w-4 h-4"/>
                                                Original Size
                                            </p>
                                            <p className="text-2xl font-bold text-purple-400">{formatFileSize(result.originalSize)}</p>
                                        </div>
                                        <div className="space-y-2 bg-slate-700/30 rounded-lg p-4">
                                            <p className="font-medium text-slate-300 flex items-center gap-2">
                                                <Archive className="w-4 h-4"/>
                                                {result.type === "compress" ? "Compressed" : "Decompressed"} Size
                                            </p>
                                            <p className="text-2xl font-bold text-orange-400">{formatFileSize(result.processedSize)}</p>
                                        </div>
                                    </div>

                                    <div className="border-t border-slate-600 pt-4">
                                        <div className="flex justify-between items-center mb-2">
                                        <span className="font-medium text-slate-300 flex items-center gap-2">
                                            <TrendingUp className="w-4 h-4"/>
                                            {result.type === "compress" ? "Compression" : "Size Change"} Ratio
                                        </span>
                                            <span
                                                className={`text-lg font-bold flex items-center gap-1 ${
                                                    result.compressionRatio > 0 ? "text-emerald-400" : "text-red-400"
                                                }`}
                                            >
                                              {result.compressionRatio > 0 ? (
                                                  <CheckCircle className="w-4 h-4"/>
                                              ) : (
                                                  <XCircle className="w-4 h-4"/>
                                              )}
                                                {result.compressionRatio > 0 ? "-" : "+"}
                                                {Math.abs(result.compressionRatio).toFixed(1)}%
                                            </span>
                                        </div>
                                        <Progress value={Math.min(Math.abs(result.compressionRatio), 100)}
                                                  className="w-full bg-slate-700"/>
                                    </div>

                                    <Button
                                        onClick={downloadResult}
                                        className="flex items-center justify-center bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white border-0 mx-auto"
                                        size="lg"
                                    >
                                        <Download className="w-4 h-4 mr-2" />
                                        Download {result.type === "compress" ? "Compressed" : "Decompressed"} File
                                    </Button>

                                </div>
                            ) : (
                                <div className="text-center py-8 text-slate-400">
                                    <FileText className="w-16 h-16 mx-auto mb-4 opacity-50" />
                                    <p>Select a file and choose an action to see results</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
