import { stdout } from "process";
import fs from "fs";
import sharp from "sharp";
class ASCII_Generator {
    constructor(filePath, args) {
        this.ASCII_CHARS = "$@B%8&WM#*oahkbdpqwmZO0QLCJUYXzcvunxrjft/\\|()1{}[]?-_+~<>i!lI;:,\"^`'. ".split("");
        this.charLength = this.ASCII_CHARS.length;
        this.interval = this.charLength / 256;
        this.toFile = false;
        this.toConsole = true;
        this.withColor = false;
        this.onAdaptive = false;
        console.log(this.interval);
        if (args) {
            this.chechParams(args);
        }
        this.filePath = filePath;
        const sourceImg = sharp(this.filePath);
        let newImg;
        this.getSize(sourceImg)
            .then(s => {
            // newImg = this.resizeImage(sourceImg, s)
            this.withColor ? newImg = this.convertColorImage(sourceImg) : newImg = this.convertGreyImage(sourceImg);
            newImg = this.resizeImage(newImg, s);
            this.toFile ? this.printToFile(newImg, s[0]) : this.printToConsole(newImg, s[0]);
        });
    }
    resizeImage(img, size) {
        console.log(size);
        return img.resize(size[0], size[1], {
            fit: "inside",
        });
    }
    async getSize(img) {
        const ratio = (stdout.columns / stdout.rows) / 2;
        const size = [Math.floor(stdout.rows * ratio), Math.floor(stdout.rows * ratio)];
        if (this.onAdaptive) {
            return size;
        }
        else {
            let meta = await img.metadata();
            let width = meta.width || 100;
            let height = meta.height || 100;
            if (width > 1500 || height > 1500) {
                return [1500, 1500];
            }
            return [width, height];
        }
    }
    convertGreyImage(img) {
        return img.greyscale();
    }
    convertColorImage(img) {
        throw new Error("Function not implemented.");
    }
    printToFile(img, width) {
        this.createArt(img, width)
            .then(ar => {
            fs.writeFileSync("Art.txt", ar);
        });
    }
    printToConsole(img, width) {
        this.createArt(img, width)
            .then(ar => {
            console.log(ar);
        });
    }
    async createArt(img, width) {
        let imagePixels = await img.raw().toBuffer();
        let characters = "";
        let charCount = [];
        imagePixels.forEach((pixel) => {
            let char = this.ASCII_CHARS[Math.floor(pixel * this.interval)];
            let a = charCount.find((i) => i.char === char);
            if (a !== undefined)
                a.count++;
            else
                charCount.push({ char, count: 1 });
            characters = characters + char;
        });
        let maxSymbol = charCount.filter((i) => Math.max(i.count))[0].char;
        characters = characters.split("").map((c) => { if (c === maxSymbol)
            return " ";
        else
            return c; }).join("");
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
            if (i === "-a" || i === "--adaptive") {
                this.onAdaptive = true;
            }
        }
    }
}
main();
function main() {
    // let [filePath, ...param] = ques.promptCL()
    // if (fs.existsSync(filePath)) {
    new ASCII_Generator("cap.jpg", ['-a', '-f']);
    // }
    // else {
    //     console.log('file on apth not exist');
    //     exit(0)
    // }
}
//# sourceMappingURL=main.js.map