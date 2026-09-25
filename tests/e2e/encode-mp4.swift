// Encodes timestamped JPEG frames into an H.264 MP4 with macOS's AVFoundation.
// Used by hd-recorder.ts on macOS, where Playwright's bundled ffmpeg can only write WebM.
// Usage: swift encode-mp4.swift <frames.txt> <out.mp4> <width> <height>
// frames.txt has one "<milliseconds> <jpeg path>" line per frame; the last line's frame is held until "<ms> END".
import AVFoundation
import CoreGraphics
import Foundation
import ImageIO

let args = CommandLine.arguments
guard args.count == 5, let width = Int(args[3]), let height = Int(args[4]) else {
  FileHandle.standardError.write("usage: encode-mp4.swift frames.txt out.mp4 width height\n".data(using: .utf8)!)
  exit(2)
}
let entries: [(ms: Int64, path: String)] = try String(contentsOfFile: args[1], encoding: .utf8)
  .split(separator: "\n")
  .map { line in
    let parts = line.split(separator: " ", maxSplits: 1)
    return (Int64(parts[0])!, String(parts[1]))
  }

let out = URL(fileURLWithPath: args[2])
try? FileManager.default.removeItem(at: out)
let writer = try AVAssetWriter(outputURL: out, fileType: .mp4)
let input = AVAssetWriterInput(mediaType: .video, outputSettings: [
  AVVideoCodecKey: AVVideoCodecType.h264,
  AVVideoWidthKey: width,
  AVVideoHeightKey: height,
  AVVideoCompressionPropertiesKey: [
    AVVideoAverageBitRateKey: 12_000_000,
    AVVideoProfileLevelKey: AVVideoProfileLevelH264HighAutoLevel,
    AVVideoMaxKeyFrameIntervalKey: 60,
  ],
])
input.expectsMediaDataInRealTime = false
let adaptor = AVAssetWriterInputPixelBufferAdaptor(assetWriterInput: input, sourcePixelBufferAttributes: [
  kCVPixelBufferPixelFormatTypeKey as String: kCVPixelFormatType_32BGRA,
  kCVPixelBufferWidthKey as String: width,
  kCVPixelBufferHeightKey as String: height,
])
writer.add(input)
writer.startWriting()
writer.startSession(atSourceTime: .zero)

func buffer(for path: String) -> CVPixelBuffer? {
  guard let src = CGImageSourceCreateWithURL(URL(fileURLWithPath: path) as CFURL, nil),
        let image = CGImageSourceCreateImageAtIndex(src, 0, nil),
        let pool = adaptor.pixelBufferPool else { return nil }
  var pb: CVPixelBuffer?
  CVPixelBufferPoolCreatePixelBuffer(nil, pool, &pb)
  guard let pixel = pb else { return nil }
  CVPixelBufferLockBaseAddress(pixel, [])
  let ctx = CGContext(data: CVPixelBufferGetBaseAddress(pixel), width: width, height: height, bitsPerComponent: 8,
                      bytesPerRow: CVPixelBufferGetBytesPerRow(pixel), space: CGColorSpaceCreateDeviceRGB(),
                      bitmapInfo: CGImageAlphaInfo.premultipliedFirst.rawValue | CGBitmapInfo.byteOrder32Little.rawValue)
  ctx?.draw(image, in: CGRect(x: 0, y: 0, width: width, height: height))
  CVPixelBufferUnlockBaseAddress(pixel, [])
  return pixel
}

// Variable frame rate: each captured frame is shown from its own timestamp until the next one.
var last: CVPixelBuffer?
for entry in entries {
  let pixel = entry.path == "END" ? last : buffer(for: entry.path)
  guard let pixel else { continue }
  while !input.isReadyForMoreMediaData { Thread.sleep(forTimeInterval: 0.005) }
  adaptor.append(pixel, withPresentationTime: CMTime(value: entry.ms, timescale: 1000))
  last = pixel
}
input.markAsFinished()
let done = DispatchSemaphore(value: 0)
writer.finishWriting { done.signal() }
done.wait()
if writer.status != .completed {
  FileHandle.standardError.write("encode failed: \(String(describing: writer.error))\n".data(using: .utf8)!)
  exit(1)
}
