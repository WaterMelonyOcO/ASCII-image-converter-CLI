import { stdout } from "process";
import fs from "fs";
import sharp from "sharp";
import { SingleBar, Presets } from "cli-progress";
class ASCII_Generator {
    constructor(filePath, args) {
        this.ASCII_CHARS = "$@B%8&WM#*oahkbdpqwmZO0QLCJUYXzcvunxrjft/\\|()1{}[]?-_+~<>i!lI;:,\"^`'. ".split("");
        this.charLength = this.ASCII_CHARS.length;
        this.interval = this.charLength / 256;
        this.toFile = false;
        this.toConsole = true;
        this.withColor = false;
        this.onAdaptive = false;
        this.background = false;
        console.log(this.interval);
        this.bar = new SingleBar({}, Presets.legacy);
        // let bar = new SingleBar({}, Presets.legacy)
        this.bar.start(100, 0);
        if (args) {
            this.chechParams(args);
        }
        this.filePath = filePath;
        const sourceImg = sharp(this.filePath);
        let newImg;
        this.bar.increment(10);
        this.getSize(sourceImg)
            .then(s => {
            newImg = this.resizeImage(sourceImg, s);
            this.bar.increment(20);
            this.withColor ? newImg = this.convertColorImage(newImg) : newImg = this.convertGreyImage(newImg);
            this.bar.increment(20);
            this.toFile ? this.printToFile(newImg, s[0]) : this.printToConsole(newImg, s[0]);
            this.bar.increment(20);
        });
        this.bar.update(100);
        this.bar.stop();
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
            // this.bar.increment(10)
            return size;
        }
        else {
            let meta = await img.metadata();
            let width = meta.width || 100;
            let height = meta.height || 100;
            if (width > 1500 || height > 1500) {
                return [1500, 1500];
            }
            // this.bar.increment(10)
            return [width, height];
        }
    }
    convertGreyImage(img) {
        this.bar.increment(10);
        return img.greyscale();
    }
    //in work
    convertColorImage(img) {
        this.bar.increment(10);
        throw new Error("Function not implemented.");
    }
    printToFile(img, width) {
        this.bar.update(100);
        // this.bar.stop()
        this.createArt(img, width)
            .then(ar => {
            fs.writeFileSync("Art.txt", ar);
        });
    }
    printToConsole(img, width) {
        this.bar.update(100);
        // this.bar.stop()
        this.createArt(img, width)
            .then(ar => {
            console.log(ar);
        });
    }
    clearOftenSym(img, width) {
        let charCount = [];
        let tempImg = '';
        this.bar.increment(10);
        img.split("").forEach((char) => {
            let charCheck = charCount.find((i) => i.char === char);
            if (charCheck !== undefined)
                charCheck.count++;
            else
                charCount.push({ char, count: 1 });
        });
        this.bar.increment(10);
        let maxSymbol = charCount.filter((i) => Math.max(i.count))[0].char;
        img = img.split("").map((c) => { if (c === maxSymbol)
            return " ";
        else
            return c; }).join("");
        for (let i = 0; i < img.length; i += width) {
            let line = img.substring(i, i + width);
            if (line.trim() !== "") {
                tempImg = tempImg + line;
            }
        }
        this.bar.increment(10);
        img = tempImg;
        return img;
    }
    //in work(try add clear background)
    async createArt(img, width) {
        let imagePixels = await img.raw().toBuffer();
        let characters = "";
        this.bar.increment(10);
        imagePixels.forEach((pixel) => {
            let char = this.ASCII_CHARS[Math.floor(pixel * this.interval)];
            characters = characters + char;
        });
        this.background ? characters = this.clearOftenSym(characters, width) : characters;
        this.bar.increment(10);
        let ASCII = "";
        for (let i = width; i < characters.length; i += width) {
            let line = characters.substring(i, i + width);
            // let line = characters.split("").slice(i, i + width).toString();
            ASCII = ASCII + "\n" + line;
        }
        this.bar.increment(10);
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
            if (i === "-b" || i === "--offbackground") {
                this.background = true;
            }
        }
    }
}
main();
function main() {
    // let [filePath, ...param] = ques.promptCL()
    // if (fs.existsSync(filePath)) {
    new ASCII_Generator("duck.jpg", ['-f', '-b']);
    // }
    // else {
    //     console.log('file on apth not exist');
    //     exit(0)
    // }
}
//# sourceMappingURL=main.js.map