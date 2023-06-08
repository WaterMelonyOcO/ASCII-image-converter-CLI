import { exit, off, stdout } from "process";
import fs, { PathLike } from "fs";
import sharp from "sharp";
import ques from "readline-sync";
import { SingleBar, Presets } from "cli-progress";


type size = [number, number]
type charCounter = { count: number, char: string }[]
// type charData = {[]}
type charData = {
    pixelOffset: number[];
    chars: string[]
}

class ASCII_Generator {

    private readonly ASCII_CHARS: string[] = "$@B%8&WM#*oahkbdpqwmZO0QLCJUYXzcvunxrjft/\\|()1{}[]?-_+~<>i!lI;:,\"^`'. ".split(
        ""
    );
    private readonly charLength: number = this.ASCII_CHARS.length;
    private readonly interval: number = this.charLength / 256;
    readonly filePath: string;

    toFile = false;
    toConsole = true;
    withColor = false;
    onAdaptive = false;
    background = false;
    bar: SingleBar;

    constructor(filePath: string, args?: string[]) {
        console.log(this.interval);

        this.bar = new SingleBar({}, Presets.legacy)
        // let bar = new SingleBar({}, Presets.legacy)
        this.bar.start(100, 0)
        if (args) {
            this.chechParams(args)
        }
        this.filePath = filePath
        const sourceImg = sharp(this.filePath);
        let newImg
        this.bar.increment(10)

        this.getSize(sourceImg)
            .then(s => {
                newImg = this.resizeImage(sourceImg, s)
                this.bar.increment(20)
                this.convertGreyImage(newImg);
                this.toFile ? this.printToFile(newImg, s[0]) : this.printToConsole(newImg, s[0])
                this.bar.increment(20)
            })

        this.bar.update(100)
        this.bar.stop()
    }

    resizeImage(img: sharp.Sharp, size: size): sharp.Sharp {

        console.log(size);

        return img.resize(size[0], size[1], {
            fit: "inside",
        })
    }

    async getSize(img: sharp.Sharp): Promise<size> {
        const ratio: number = (stdout.columns / stdout.rows) / 2
        const size: size = [Math.floor(stdout.rows * ratio), Math.floor(stdout.rows * ratio)]

        if (this.onAdaptive) {
            // this.bar.increment(10)
            return size;
        }
        else {
            let meta = await img.metadata()
            let width = meta.width || 100
            let height = meta.height || 100

            if (width > 1500 || height > 1500) {
                return [1500, 1500];
            }
            // this.bar.increment(10)
            return [width, height]
        }

    }

    convertGreyImage(img: sharp.Sharp): sharp.Sharp {
        this.bar.increment(10)
        return img.greyscale()
    }

    //in work
    ColorOut(img: charData, imageColorBuf: Buffer): charData {
        this.bar.increment(10)

        let [offset, char] = Object.values(img);
        let tempChar = <string[]>char
        let tempOffset = <number[]>offset

        for (let i = 0; i < char.length; i++) {
            if (tempChar[i] === " ") {
                tempChar[i] = " "
            }

            else {
                let rgb = { r: imageColorBuf[tempOffset[i]], g: imageColorBuf[tempOffset[i+1]], b: imageColorBuf[tempOffset[i+2]] }
                tempChar[i] = `\x1b[38;2;${rgb.r};${rgb.g};${rgb.b}m${tempChar[i]}`;
                // let char = `\x1b[38;5;${imageColorBuf[i]}m${img[i]}`;
                // colorfulText.push(tempChar[i])
            }

        }
        return {pixelOffset: tempOffset, chars: tempChar};
    }

    printToFile(img: sharp.Sharp, width: number): void {

        this.bar.update(100)
        // this.bar.stop()
        this.createArt(img, width)
            .then(ar => {
                fs.writeFileSync("Art.txt", ar)
            })
    }

    printToConsole(img: sharp.Sharp, width: number): void {

        this.bar.update(100)
        // this.bar.stop()
        this.createArt(img, width)
            .then(ar => {
                console.log(ar);
            })
    }

    clearOftenSym(imgArr: charData, width: number): charData {

        let charCount: charCounter = []
        let tempImg: string = '';
        let img = ''

        let [offset, char] = Object.values(imgArr)
        let tempOffSet = <number[]>offset

        char.forEach((char: any) => {

            let charCheck = charCount.find((i) => i.char === char)
            if (charCheck !== undefined) charCheck.count++; else charCount.push({ count: 1, char })

        })

        let maxSymbol = charCount.filter((i) => Math.max(i.count))[0].char
        img = char.map((c, i) => {
            if (c === maxSymbol) {
                return " "
            }
            else { 
                offset[i] = i
                return c 
            }
        }).join("");

        for (let i = 0; i < img.length; i += width) {
            let line = img.substring(i, i + width);
            if (line.trim() !== "") {
                tempImg = tempImg + line;
            }
        }
        img = tempImg;
        return {pixelOffset: tempOffSet, chars: img.split('')}
    }

    async createArt(img: sharp.Sharp, width: number): Promise<string> {
        let imagePixels: Buffer = await img.raw().toBuffer();
        let charactersData: charData = { pixelOffset: [], chars: [] };


        imagePixels.forEach((pixel: number, ind) => {
            let char: string = this.ASCII_CHARS[Math.floor(pixel * this.interval)];
            charactersData.pixelOffset.push(ind);
            charactersData.chars.push(char);
        });

        this.background ? charactersData = this.clearOftenSym(charactersData, width) : charactersData
        this.withColor ? charactersData = this.ColorOut(charactersData, imagePixels) : charactersData


        let ASCII = '';
        let chars = charactersData.chars
        for (let i = width; i < charactersData.chars.length; i += width) {
            let line = chars.slice(i, i + width).join('').replace('.', '');

            // let line = characters.split("").slice(i, i + width).toString();
            ASCII = ASCII + "\n" + line;
        }
        return ASCII
    }

    chechParams(args: string[]): void {
        for (let i of args) {
            if (i === "-c" || i === "--color") {
                this.withColor = true
            }
            if (i === "-f" || i === "--toFile") {
                this.toFile = true;
                this.toConsole = false
            }
            if (i === "-t" || i === "--terminal") {
                this.toConsole = true
            }
            if (i === "-a" || i === "--adaptive") {
                this.onAdaptive = true
            }
            if (i === "-b" || i === "--offbackground") {
                this.background = true
            }
        }
    }
}
main()
function main(): void {
    // let [filePath, ...param] = ques.promptCL()

    // if (fs.existsSync(filePath)) {
    new ASCII_Generator("duck.jpg", ['-c', '-f'])
    // }
    // else {
    //     console.log('file on apth not exist');
    //     exit(0)
    // }
}


