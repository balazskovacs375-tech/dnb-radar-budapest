import AppKit
import Foundation

let width = 1200
let height = 630
let image = NSBitmapImageRep(
    bitmapDataPlanes: nil,
    pixelsWide: width,
    pixelsHigh: height,
    bitsPerSample: 8,
    samplesPerPixel: 4,
    hasAlpha: true,
    isPlanar: false,
    colorSpaceName: .deviceRGB,
    bytesPerRow: 0,
    bitsPerPixel: 0
)!
let context = NSGraphicsContext(bitmapImageRep: image)!
NSGraphicsContext.saveGraphicsState()
NSGraphicsContext.current = context
context.imageInterpolation = .high

let black = NSColor(calibratedRed: 8/255, green: 8/255, blue: 8/255, alpha: 1)
let white = NSColor(calibratedRed: 250/255, green: 249/255, blue: 246/255, alpha: 1)
let muted = NSColor(calibratedRed: 185/255, green: 180/255, blue: 175/255, alpha: 1)
let red = NSColor(calibratedRed: 240/255, green: 71/255, blue: 58/255, alpha: 1)
let line = NSColor(calibratedRed: 75/255, green: 72/255, blue: 69/255, alpha: 1)

black.setFill()
NSRect(x: 0, y: 0, width: width, height: height).fill()

func rule(_ x: CGFloat, _ y: CGFloat, _ w: CGFloat, _ h: CGFloat, _ color: NSColor) {
    color.setFill()
    NSRect(x: x, y: y, width: w, height: h).fill()
}

func text(_ value: String, y: CGFloat, font: NSFont, color: NSColor, tracking: CGFloat, align: String = "center", x: CGFloat = 0) {
    let content = NSAttributedString(string: value, attributes: [
        .font: font,
        .foregroundColor: color,
        .kern: tracking
    ])
    let measured = content.size()
    let px = align == "center" ? (CGFloat(width) - measured.width) / 2 : x
    content.draw(at: NSPoint(x: px, y: y))
}

let light = NSFont(name: "HelveticaNeue-Light", size: 81) ?? NSFont.systemFont(ofSize: 81, weight: .ultraLight)
let city = NSFont(name: "HelveticaNeue-Light", size: 86) ?? NSFont.systemFont(ofSize: 86, weight: .ultraLight)
let brand = NSFont(name: "HelveticaNeue-Medium", size: 23) ?? NSFont.systemFont(ofSize: 23, weight: .medium)
let caption = NSFont(name: "HelveticaNeue-Medium", size: 17) ?? NSFont.systemFont(ofSize: 17, weight: .medium)
let xFont = NSFont(name: "HelveticaNeue-Light", size: 57) ?? NSFont.systemFont(ofSize: 57, weight: .light)

rule(57, 557, 1086, 1, line)
rule(57, 75, 1086, 1, line)
rule(57, 555, 92, 3, red)
text("DNB RADAR", y: 578, font: brand, color: white, tracking: 5, align: "left", x: 57)
text("BUDAPEST / EVENTS", y: 579, font: caption, color: muted, tracking: 2.8, align: "left", x: 903)

text("DRUM AND BASS", y: 375, font: light, color: white, tracking: 6.1)
text("X", y: 278, font: xFont, color: red, tracking: 0)
text("BUDAPEST", y: 166, font: city, color: white, tracking: 12)

rule(465, 124, 270, 4, red)
text("UPCOMING NIGHTS  /  OFFICIAL LINKS", y: 36, font: caption, color: muted, tracking: 2.4)

context.flushGraphics()
NSGraphicsContext.restoreGraphicsState()

let destination = CommandLine.arguments.dropFirst().first ?? "dnb-radar-social.png"
let data = image.representation(using: .png, properties: [:])!
try data.write(to: URL(fileURLWithPath: destination))
