import { Elm } from "./src/Main.elm";
import html2canvas from "html2canvas";

if (process.env.NODE_ENV === "development") {
  const ElmDebugTransform = await import("elm-debug-transformer");

  ElmDebugTransform.register({
    simple_mode: true,
  });
}

const app = Elm.Main.init({ node: document.querySelector("#root") });

app.ports.printElement.subscribe((id) => {
  const element = document.querySelector(`#${id}`);
  if (element === null) return;

  html2canvas(element, { allowTaint: true }).then((canvas) => {
    Canvas2Image.saveAsPNG(canvas);
  });
});
