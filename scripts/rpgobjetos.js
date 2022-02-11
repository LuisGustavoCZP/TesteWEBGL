import { SpriteFrame, SpriteSource, GOSprite, AnimatedSprite } from "./gosprite.js";

export class Objeto 
{
    constructor (posX, posY){
        this.positionX = posX;
        this.positionY = posY;
    }
}

export class GameObjeto extends Objeto
{
    constructor (sprite, posX, posY, size, rot)
    {
        super(posX, posY);
        this.size = size;
        this.sprite = sprite;
        this.rotation = rot;
    }

    static defaultFrame = new SpriteFrame(16,16,1);

    draw(canvas, context) {
        const hsize = this.size / 2;
        const cx = this.positionX + (canvas.width/2), cy = this.positionY + (canvas.height/2); //hsize
        //console.log("Drawing GO");
        context.translate(cx, cy);
        context.rotate((Math.PI / 180) * this.rotation);     
        context.translate(-cx, -cy);
        this.sprite.draw(context, cx, cy, this.size);
        context.translate(cx, cy);
        context.rotate((Math.PI / 180) * -this.rotation);
        context.translate(-cx, -cy);
    }
}

export class PhysicObjeto extends GameObjeto 
{
    constructor (sprite, positionX, positionY, size, rotation, isTrigger)
    {
        super(sprite, positionX, positionY, size, rotation);
        this.colliding = false;
        this.collisions = [];
        this.isTrigger = isTrigger;
    }

    collision (other){
        if(!this.isTrigger && (this.positionX + this.size > other.positionX 
            && this.positionX < other.positionX + other.size 
            && this.positionY + this.size > other.positionY 
            && this.positionY < other.positionY + other.size))
        {
            this.colliding = true;
            other.colliding = false;
            //console.log(this + " colidiu " + other);
        } else {
            other.colliding = false;
            this.colliding = false;
        }
        
    }
}

export class DynamicObjeto extends PhysicObjeto 
{
    constructor (sprite, positionX, positionY, size, rotation, isTrigger, speedRotation, speed)
    {
        super(sprite, positionX, positionY, size, rotation, isTrigger);

        this.speedRot = speedRotation;
        this.speed = speed;
        this.directionX = 0;
        this.directionY = 0;
    }

    update()
    {
        const velX = this.directionX*this.speed, velY = this.directionY*this.speed;
        if(this.colliding)
        {
            velX = -velX;
            velY = -velY;
        }

        const vXmod = Math.abs(velX);
        const vYmod = Math.abs(velY);

        if(vXmod + vYmod == 0){
            this.sprite.playing = false;
        } else {
            if(vXmod <= vYmod) 
            {
                if(velY > 0) {
                    this.sprite.animation = 1;
                }
                else if(velY < 0) {
                    this.sprite.animation = 2;
                }
            } 
            else if(vXmod > vYmod) 
            {
                if(velX > 0) {
                    this.sprite.animation = 3;
                }
                else if(velX < 0) {
                    this.sprite.animation = 0;
                }
            }
            this.sprite.playing = true;
        }
        
        this.positionX += velX;
        this.positionY += velY;
    }
}

export class Character extends DynamicObjeto 
{
    constructor (sprite, positionX, positionY, size, rotation, isTrigger, speedRotation, speed, name)
    {
        super(sprite, positionX, positionY, size, rotation, isTrigger, speedRotation, speed);
        this.name = name;
    }

    static Load (data)
    {
        console.log("Lendo sprite " + data.name);
        const sp = SpriteSource.Load(data.spriteSource);
        const anim = new AnimatedSprite(super.defaultFrame, sp);
        
        console.log(anim);

        return new Character(anim, data.positionX, data.positionY, data.size, data.rotation, data.isTrigger, data.speedRotation, data.speed, data.name);
    }
}

export class Tile extends Objeto
{
    constructor (posX, posY, type)
    {
        super(posX, posY);
        this.type = type;
    }

    static Load (data)
    {
        //if(data.hasOwnProperty("subtiles")) return TileNode.Load(data);
        //else return TileLeaf.Load(data);
        return new Tile(data.positionX, data.positionY, data.type);
    }
}

/*class TileNode extends Tile
{
    constructor (posX, posY, size, subtiles)
    {
        super(posX, posY, size);
        this.subtiles = subtiles;
    }

    static Load (data)
    {
        return new TileNode(data.positionX, data.positionY, data.size, data.subtiles);
    }
}

class TileLeaf extends Tile
{
    constructor (posX, posY, size, type)
    {
        super(posX, posY, size);
        this.type = type;
    }

    static Load (data)
    {
        return new TileLeaf(data.positionX, data.positionY, data.size, data.type);
    }
}*/

export class TilePrefab
{
    static defaultFrame;
    static GetDFrame () {
        if(this.defaultFrame == undefined) {
            this.defaultFrame = new SpriteFrame(16,16,1);
        }
        return this.defaultFrame;
    }

    constructor (spriteSource, size, block)
    {
        this.sprite = new GOSprite(TilePrefab.GetDFrame (), spriteSource);
        this.size = size;
        this.block = block;
    }

    static Load (data)
    {
        return new TilePrefab(SpriteSource.Load(data.spriteSource), data.size, data.block);
    }

    draw(context, posX, posY) {
        this.sprite.draw(context, posX, posY, this.size);
    }
}

export class TileMap 
{
    constructor (name, width, height, tiles, tilesheet)
    {
        this.name = name;
        this.width = width;
        this.height = height;
        this.tiles = tiles;
        this.tilesheet = tilesheet;
    }
    
    static Create (name, width, height, tilesheet)
    {
        const tiles = [];
        
        for (let j = 0; j < height; j++) 
        {
            const c = (height*j);
            for (let i = 0; i < width; i++) {
                tiles.push(new Tile(i, j, tilesheet[0]));
            }
        }
        return new TileMap(name, width, height, tiles, tilesheet);
    }

    static Load (mapdata, tilesheetdata)
    {
        let tilesheet = [];
        for (let i = 0; i < tilesheetdata.length; i++) 
        {
            console.log("Lendo sprite tile[" + i + "]");
            tilesheet.push(TilePrefab.Load(tilesheetdata[i]));
        }
        let tiles = [];
        for (let i = 0; i < mapdata.tiles.length; i++) 
        {
            tiles.push(Tile.Load(mapdata.tiles[i]));
        }
        
        return new TileMap(mapdata.name, mapdata.width, mapdata.height, tiles, tilesheet);
    }

    draw(canvas, context) {
        for(let i = 0; i < this.tiles.length; i++) {
            let t = this.tiles[i];
            let tsh = this.tilesheet[t.type];
            if(tsh == undefined) {
                console.log("Tilesheet nao encontrado!");
                continue;
            }
            let hsize = tsh.size;
            
            let cx = (t.positionX*hsize) + (canvas.width/2), cy = (t.positionY*hsize) + (canvas.height/2);
            //console.log("Tilesheet nao encontrado!");
            //context.translate(cx, cy);
            tsh.draw(context, cx, cy);
        }
    }
}