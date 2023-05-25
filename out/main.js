import { exit, stdout } from "process";
import fs from "fs";
import sharp from "sharp";
import ques from "readline-sync";
class ASCII_Generator {
    constructor(filePath, args) {
        this.ASCII_CHARS = "$@B%8&WM#*oahkbdpqwmZO0QLCJUYXzcvunxrjft/\\|()1{}[]?-_+~<>i!lI;:,\"^`'. ".split("");
        this.charLength = this.ASCII_CHARS.length;
        this.interval = this.charLength / 256;
        this.toFile = false;
        this.toConsole = true;
        this.withColor = false;
        this.inFullScreen = false;
        if (args) {
            this.chechParams(args);
        }
        this.filePath = filePath;
        let sourceImg = sharp(this.filePath);
        this.toFile ? this.printToFile(sourceImg) : this.printToConsole(sourceImg);
    }
    convertGreyImage(img) {
        let newImg = img.greyscale();
        return newImg;
    }
    convertColorImage(img) {
        throw new Error("Function not implemented.");
    }
    resizeImage(img) {
        const ratio = (process.stdout.columns / process.stdout.rows) / 2;
        const size = [Math.floor(stdout.rows * ratio), Math.floor(stdout.rows * ratio)];
        return img.resize(size[0], size[1], {
            fit: "inside",
        });
    }
    printToFile(img) {
        this.inFullScreen ? null : img = this.resizeImage(img);
        this.withColor ? img = this.convertColorImage(img) : img = this.convertGreyImage(img);
        this.createArt(img)
            .then(ar => {
            fs.writeFileSync("Art.txt", ar);
        });
    }
    printToConsole(img) {
        this.inFullScreen ? null : img = this.resizeImage(img);
        this.withColor ? img = this.convertColorImage(img) : img = this.convertGreyImage(img);
        this.createArt(img)
            .then(ar => {
            console.log(ar);
        });
    }
    async createArt(img) {
        let imagePixels = await img.raw().toBuffer();
        let characters = "";
        let width = (await img.metadata()).width || 100;
        imagePixels.forEach((pixel) => {
            characters = characters + this.ASCII_CHARS[Math.floor(pixel * this.interval)];
        });
        let ASCII = "";
        for (let i = 0; i < characters.length; i += width) {
            let line = characters.split("").slice(i, i + width);
            ASCII = ASCII + "\n" + line;
        }
        return ASCII;
    }
    chechParams(args) {
        for (let i of args) {
            if (i === "-c" || i === "--color") {
                this.withColor = true;
            }
            if (i === "-f" || i === "--toFile") {
                this.toFile = true;
                this.toConsole = false;
            }
            if (i === "-t" || i === "--console") {
                this.toConsole = true;
            }
            if (i === "-w" || i === "--windowed") {
                this.inFullScreen = false;
            }
        }
    }
}
main();
function main() {
    let [filePath, ...param] = ques.promptCL();
    if (fs.existsSync(filePath)) {
        new ASCII_Generator(filePath, param);
    }
    else {
        console.log('file on apth not exist');
        exit(0);
    }
}
//# sourceMappingURL=main.js.map