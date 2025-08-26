import { Settings } from "@/types";
import { fmtClock } from "./timer";

export async function composePhoto(photoURL: string, settings: Settings, distance: string) {
    const img = new Image();
    img.src = photoURL;
    await img.decode();

    const canvas = document.createElement("canvas");
    const maxW = 1920;
    const scale = Math.min(1, maxW / img.width);
    canvas.width = Math.round(img.width * scale);
    canvas.height = Math.round(img.height * scale);
    const ctx = canvas.getContext("2d")!;
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

    const pad = Math.round(canvas.width * 0.04);
    ctx.fillStyle = "rgba(0,0,0,0.55)";
    const boxH = Math.round(canvas.height * 0.2);
    ctx.fillRect(0, canvas.height - boxH, canvas.width, boxH);

    ctx.fillStyle = "#fff";
    ctx.font = `bold ${Math.round(canvas.width * 0.06)}px ui-sans-serif`;
    ctx.fillText("Async", pad, canvas.height - boxH + pad + 8);

    ctx.font = `500 ${Math.round(canvas.width * 0.045)}px ui-sans-serif`;
    const elapsed =
        settings.warmupSec +
        settings.sets * (settings.runSec + settings.restSec) -
        settings.restSec;
    const d = parseFloat(distance || "0");
    const pace = d ? elapsed / 60 / d : 0;
    const paceStr = d
        ? `${Math.floor(pace)}:${Math.round((pace - Math.floor(pace)) * 60)
              .toString()
              .padStart(2, "0")} /km`
        : "pace —";
    const lines = [
        `distance ${distance || "-"} km`,
        `pace ${paceStr}`,
        `elapsed ${fmtClock(elapsed)}`,
        `sets ${settings.sets} (run ${settings.runSec}s / rest ${settings.restSec}s)`,
    ];
    lines.forEach((t, i) =>
        ctx.fillText(
            t,
            pad,
            canvas.height - boxH + pad * 1.8 + i * Math.round(canvas.width * 0.048)
        )
    );

    return canvas.toDataURL("image/jpeg", 0.9);
}
