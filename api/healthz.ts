export default function handler(_req: any, res: any) {
  res.status(200).json({
    status: "healthy",
    services: {
      libreoffice_headless: "static-client",
      ffmpeg: "static-client",
    },
    timestamp: Date.now(),
  });
}
