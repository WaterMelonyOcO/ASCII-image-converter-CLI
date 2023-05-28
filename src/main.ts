import { exit, stdout } from "process";
import fs, { PathLike } from "fs";
import sharp from "sharp";
import ques from "readline-sync";

type size = [number, number]
type charCounter = { char: string, count: number }[]

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

    constructor(filePath: string, args?: string[]) {
        console.log(this.interval);

        if (args) {
            this.chechParams(args)
        }
        this.filePath = filePath
        const sourceImg = sharp(this.filePath);
        let newImg

        this.getSize(sourceImg)
            .then(s => {
                newImg = this.resizeImage(sourceImg, s)
                this.withColor ? newImg = this.convertColorImage(newImg) : newImg = this.convertGreyImage(newImg);
                this.toFile ? this.printToFile(newImg, s[0]) : this.printToConsole(newImg, s[0])
            })
    }

    resizeImage(img: sharp.Sharp, size: size): sharp.Sharp {

        console.log(size);

        return img.resize(size[0], size[1], {
            fit: "inside",
        })
    }

    async getSize(img: sharp.Sharp): Promise<size> {
        const ratio: number = (stdout.columns  / stdout.rows) / 2
        const size: size = [Math.floor(stdout.rows * ratio), Math.floor(stdout.rows * ratio)]

        if (this.onAdaptive) {
            return size;
        }
        else {
            let meta = await img.metadata()
            let width = meta.width || 100
            let height = meta.height || 100

            if (width > 1500 || height > 1500) {
                return [1500, 1500];
            }
            return [width, height]
        }

    }

    convertGreyImage(img: sharp.Sharp): sharp.Sharp {
        return img.greyscale()
    }

    //in work
    convertColorImage(img: sharp.Sharp): sharp.Sharp {
        throw new Error("Function not implemented.");
    }

    printToFile(img: sharp.Sharp, width: number): void {

        this.createArt(img, width)
            .then(ar => {
                fs.writeFileSync("Art.txt", ar)
            })
    }

    printToConsole(img: sharp.Sharp, width: number): void {

        this.createArt(img, width)
            .then(ar => {
                console.log(ar);
            })
    }

    clearOftenSym(img: string) {

        let charCount: charCounter = []

        img.split("").forEach((char) => {

            let charCheck = charCount.find((i) => i.char === char)
            if (charCheck !== undefined) charCheck.count++; else charCount.push({ char, count: 1 })

        })

        let maxSymbol = charCount.filter((i) => Math.max(i.count))[0].char
        img = img.split("").map((c) => { if (c === maxSymbol) return " "; else return c }).join("")
        return img
    }

    //in work(try add clear background)
    async createArt(img: sharp.Sharp, width: number): Promise<string> {
        let imagePixels: Buffer = await img.raw().toBuffer();
        let characters = "";

        imagePixels.forEach((pixel: any) => {
            let char = this.ASCII_CHARS[Math.floor(pixel * this.interval)];
            characters = characters + char;
        });

        this.background ? characters = this.clearOftenSym(characters) : characters

        let ASCII = ""
        for (let i = width ; i < characters.length; i += width) {
            let line = characters.substring(i, i + width);

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
            if (i === "-t" || i === "--console") {
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
    new ASCII_Generator("duck.jpg", ['-a','-b'])
    // }
    // else {
    //     console.log('file on apth not exist');
    //     exit(0)
    // }
}


