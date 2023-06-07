import { exit, stdout } from "process";
import fs, { PathLike } from "fs";
import sharp from "sharp";
import ques from "readline-sync";
import {SingleBar, Presets} from "cli-progress";


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
                this.withColor ? newImg : newImg = this.convertGreyImage(newImg);
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
        const ratio: number = (stdout.columns  / stdout.rows) / 2
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
    convertColorImage(img: string[], imageColorBuf: Buffer): string[] {
        this.bar.increment(10)
        
        const colorfulText: string[] = []
        for ( let i = 0; i < img.length; i++){
            // let rgb = {r:imageColorBuf[i], g:imageColorBuf[i+1], b:imageColorBuf[i+2]}
            // let char = `\\033[38;5;${rgb.r};${rgb.g};${rgb.b}m${img[i]}`;
            let char = `\\033[38;2;${imageColorBuf[i]}m${img[i]}`;
            colorfulText.push(char)
        }

        return colorfulText;
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

    clearOftenSym(img: string, width: number) {

        let charCount: charCounter = []
        let tempImg: string = '';

        this.bar.increment(10)
        img.split("").forEach((char) => {

            let charCheck = charCount.find((i) => i.char === char)
            if (charCheck !== undefined) charCheck.count++; else charCount.push({ char, count: 1 })

        })
        this.bar.increment(10)
        let maxSymbol = charCount.filter((i) => Math.max(i.count))[0].char
        img = img.split("").map((c) => { if (c === maxSymbol) return " "; else return c }).join("");
        
        for ( let i = 0; i < img.length; i+=width ){
            let line = img.substring(i, i + width);
            if (line.trim() !== ""){
                tempImg = tempImg + line;
            }
        }
        img = tempImg
        return img
    }

    async createArt(img: sharp.Sharp, width: number): Promise<string> {
        let imagePixels: Buffer = await img.raw().toBuffer();
        let characters = "";

        
        imagePixels.forEach((pixel: any) => {
            let char = this.ASCII_CHARS[Math.floor(pixel * this.interval)];
            characters = characters + char ;
        });

        this.background ? characters = this.clearOftenSym(characters, width) : characters
        // this.withColor ? characters = this.convertColorImage(characters, imagePixels) : characters

   
        let ASCII = ""
        for (let i = width ; i < characters.length; i += width) {
            
            let line = characters.substring(i, i+width);
            // let line = characters.slice(i, i + width).toString().replace(',',"");

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


