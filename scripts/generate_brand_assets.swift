import AppKit

let outputDirectory = URL(fileURLWithPath: FileManager.default.currentDirectoryPath)
  .appendingPathComponent("public", isDirectory: true)

struct Palette {
  static let background = NSColor(calibratedRed: 0.05, green: 0.05, blue: 0.06, alpha: 1)
  static let coralA = NSColor(calibratedRed: 1.0, green: 0.49, blue: 0.45, alpha: 1)
  static let coralB = NSColor(calibratedRed: 1.0, green: 0.37, blue: 0.41, alpha: 1)
  static let whiteGlow = NSColor(calibratedWhite: 0.98, alpha: 0.98)
}

func save(_ image: NSImage, to url: URL) throws {
  guard
    let tiffData = image.tiffRepresentation,
    let bitmap = NSBitmapImageRep(data: tiffData),
    let pngData = bitmap.representation(using: .png, properties: [:])
  else {
    throw NSError(domain: "BrandAssets", code: 1)
  }

  try pngData.write(to: url)
}

func drawGlowPath(_ path: NSBezierPath, color: NSColor, lineWidth: CGFloat, glow: CGFloat) {
  NSGraphicsContext.saveGraphicsState()
  let shadow = NSShadow()
  shadow.shadowBlurRadius = glow
  shadow.shadowColor = color.withAlphaComponent(0.6)
  shadow.set()
  color.setStroke()
  path.lineWidth = lineWidth
  path.lineCapStyle = .round
  path.lineJoinStyle = .round
  path.stroke()
  NSGraphicsContext.restoreGraphicsState()
}

func turboGradient() -> NSGradient {
  NSGradient(starting: Palette.coralA, ending: Palette.coralB)!
}

func strokeGradientPath(_ path: NSBezierPath, lineWidth: CGFloat) {
  NSGraphicsContext.saveGraphicsState()
  path.lineWidth = lineWidth
  path.lineCapStyle = .round
  path.lineJoinStyle = .round
  path.addClip()
  turboGradient().draw(in: path.bounds, angle: -18)
  NSGraphicsContext.restoreGraphicsState()
}

func drawTurboLogo(in rect: CGRect, glow: CGFloat) {
  let strokeColor = Palette.coralA

  func arc(center: CGPoint, radius: CGFloat, start: CGFloat, end: CGFloat) -> NSBezierPath {
    let path = NSBezierPath()
    path.appendArc(withCenter: center, radius: radius, startAngle: start, endAngle: end, clockwise: false)
    return path
  }

  let center = CGPoint(x: rect.midX + rect.width * 0.08, y: rect.midY + rect.height * 0.02)

  let handle = NSBezierPath()
  handle.move(to: CGPoint(x: rect.minX + rect.width * 0.12, y: rect.minY + rect.height * 0.16))
  handle.line(to: CGPoint(x: rect.minX + rect.width * 0.28, y: rect.minY + rect.height * 0.32))
  drawGlowPath(handle, color: strokeColor, lineWidth: rect.width * 0.06, glow: glow)
  strokeGradientPath(handle, lineWidth: rect.width * 0.06)

  let outer = arc(center: center, radius: rect.width * 0.34, start: 146, end: 398)
  drawGlowPath(outer, color: strokeColor, lineWidth: rect.width * 0.03, glow: glow)
  strokeGradientPath(outer, lineWidth: rect.width * 0.03)

  let mid = arc(center: center, radius: rect.width * 0.28, start: 154, end: 386)
  drawGlowPath(mid, color: strokeColor, lineWidth: rect.width * 0.028, glow: glow)
  strokeGradientPath(mid, lineWidth: rect.width * 0.028)

  let inner = arc(center: center, radius: rect.width * 0.22, start: 162, end: 372)
  drawGlowPath(inner, color: strokeColor, lineWidth: rect.width * 0.025, glow: glow)
  strokeGradientPath(inner, lineWidth: rect.width * 0.025)

  let intake = NSBezierPath()
  intake.move(to: CGPoint(x: center.x + rect.width * 0.08, y: rect.maxY - rect.height * 0.18))
  intake.line(to: CGPoint(x: center.x + rect.width * 0.36, y: rect.maxY - rect.height * 0.18))
  intake.line(to: CGPoint(x: center.x + rect.width * 0.36, y: rect.maxY - rect.height * 0.05))
  drawGlowPath(intake, color: strokeColor, lineWidth: rect.width * 0.055, glow: glow)
  strokeGradientPath(intake, lineWidth: rect.width * 0.055)

  let wheelOuter = NSBezierPath(ovalIn: CGRect(
    x: center.x - rect.width * 0.17,
    y: center.y - rect.width * 0.17,
    width: rect.width * 0.34,
    height: rect.width * 0.34
  ))
  drawGlowPath(wheelOuter, color: strokeColor, lineWidth: rect.width * 0.028, glow: glow)
  strokeGradientPath(wheelOuter, lineWidth: rect.width * 0.028)

  let wheelInner = NSBezierPath(ovalIn: CGRect(
    x: center.x - rect.width * 0.06,
    y: center.y - rect.width * 0.06,
    width: rect.width * 0.12,
    height: rect.width * 0.12
  ))
  drawGlowPath(wheelInner, color: strokeColor, lineWidth: rect.width * 0.022, glow: glow)
  strokeGradientPath(wheelInner, lineWidth: rect.width * 0.022)

  for index in 0..<8 {
    let angle = CGFloat(index) * .pi / 4
    let innerRadius = rect.width * 0.07
    let outerRadius = rect.width * 0.135
    let start = CGPoint(
      x: center.x + cos(angle) * innerRadius,
      y: center.y + sin(angle) * innerRadius
    )
    let end = CGPoint(
      x: center.x + cos(angle) * outerRadius,
      y: center.y + sin(angle) * outerRadius
    )
    let spoke = NSBezierPath()
    spoke.move(to: start)
    spoke.line(to: end)
    drawGlowPath(spoke, color: strokeColor, lineWidth: rect.width * 0.018, glow: glow)
    strokeGradientPath(spoke, lineWidth: rect.width * 0.018)
  }
}

func iconImage(size: CGSize) -> NSImage {
  let image = NSImage(size: size)
  image.lockFocus()

  let rounded = NSBezierPath(roundedRect: CGRect(origin: .zero, size: size), xRadius: size.width * 0.24, yRadius: size.height * 0.24)
  Palette.background.setFill()
  rounded.fill()

  drawTurboLogo(in: CGRect(x: size.width * 0.06, y: size.height * 0.04, width: size.width * 0.88, height: size.height * 0.88), glow: size.width * 0.03)

  image.unlockFocus()
  return image
}

func wordmarkImage(size: CGSize) -> NSImage {
  let image = NSImage(size: size)
  image.lockFocus()

  Palette.background.setFill()
  NSBezierPath(rect: CGRect(origin: .zero, size: size)).fill()

  drawTurboLogo(in: CGRect(x: size.width * 0.06, y: size.height * 0.12, width: size.width * 0.40, height: size.height * 0.68), glow: size.width * 0.015)

  let paragraph = NSMutableParagraphStyle()
  paragraph.alignment = .left

  let carAttributes: [NSAttributedString.Key: Any] = [
    .font: NSFont.systemFont(ofSize: size.height * 0.22, weight: .heavy),
    .foregroundColor: Palette.coralB,
    .obliqueness: 0.18,
    .paragraphStyle: paragraph,
    .shadow: {
      let shadow = NSShadow()
      shadow.shadowBlurRadius = size.width * 0.03
      shadow.shadowColor = Palette.coralA.withAlphaComponent(0.75)
      return shadow
    }()
  ]

  let guessAttributes: [NSAttributedString.Key: Any] = [
    .font: NSFont.systemFont(ofSize: size.height * 0.22, weight: .heavy),
    .foregroundColor: Palette.whiteGlow,
    .obliqueness: 0.12,
    .paragraphStyle: paragraph,
    .shadow: {
      let shadow = NSShadow()
      shadow.shadowBlurRadius = size.width * 0.035
      shadow.shadowColor = Palette.whiteGlow.withAlphaComponent(0.9)
      return shadow
    }()
  ]

  NSAttributedString(string: "Car", attributes: carAttributes).draw(at: CGPoint(x: size.width * 0.43, y: size.height * 0.40))
  NSAttributedString(string: "Guess", attributes: guessAttributes).draw(at: CGPoint(x: size.width * 0.57, y: size.height * 0.40))

  image.unlockFocus()
  return image
}

let icon512 = iconImage(size: CGSize(width: 512, height: 512))
let icon180 = iconImage(size: CGSize(width: 180, height: 180))
let icon32 = iconImage(size: CGSize(width: 32, height: 32))
let social = wordmarkImage(size: CGSize(width: 1600, height: 840))

try save(icon512, to: outputDirectory.appendingPathComponent("favicon-512.png"))
try save(icon180, to: outputDirectory.appendingPathComponent("apple-touch-icon.png"))
try save(icon32, to: outputDirectory.appendingPathComponent("favicon-32x32.png"))
try save(social, to: outputDirectory.appendingPathComponent("carguess-social.png"))
