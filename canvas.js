if ( !window.requestAnimationFrame ) {

    window.requestAnimationFrame = ( function() {

            return window.webkitRequestAnimationFrame ||
            window.mozRequestAnimationFrame || // comment out if FF4 is slow (it caps framerate at ~30fps: https://bugzilla.mozilla.org/show_bug.cgi?id=630127)
            window.oRequestAnimationFrame ||
            window.msRequestAnimationFrame ||
            function( /* function FrameRequestCallback */ callback, /* DOMElement Element */ element ) {

                    window.setTimeout( callback, 1000 / 60 );

            };

    } )();

}

/*



cameraproperty = {
    position:
        {x:0, y:0, z:0},
    angle:
        {x:0, y:0, z:0},
    fov: 90
};
*/
function cos(x) {return Math.cos(x/180*Math.PI)};
function sin(x) {return Math.sin(x/180*Math.PI)};
function tan(x) {return Math.tan(x/180*Math.PI)};
function sigmoid(x) {return 1/(1+Math.exp(-x))};
function radian(x) {return x/180*Math.PI};
function Intersec4Point(a,b) {
    var x1=a[0].x;var y1=a[0].y;var x2=a[1].x;var y2=a[1].y;
    var x3=b[0].x;var y3=b[0].y;var x4=b[1].x;var y4=b[1].y;
    var x=((x1*y2-y1*x2)*(x3-x4)-(x1-x2)*(x3*y4-y3*x4))/((x1-x2)*(y3-y4)-(y1-y2)*(x3-x4));
    var y=((x1*y2-y1*x2)*(y3-y4)-(y1-y2)*(x3*y4-y3*x4))/((x1-x2)*(y3-y4)-(y1-y2)*(x3-x4));
    return {x:x,y:y};
};

class Projector {
    constructor(cameraproperty) {
        if (!(cameraproperty != undefined && cameraproperty.position != undefined && cameraproperty.angle != undefined && cameraproperty.fov != undefined)) console.log("Invalid Input");
        this.Cam = cameraproperty;
        this.ViewData = [];
        this.DrawQueue = function(data) {
            if (this.ViewData.length == 0){
                this.ViewData.push(data);
            } else {
                var passed = true;
                this.ViewData.forEach((vdata,veach) => {
                    if (passed){
                        if (vdata.distance <= data.distance) {this.ViewData.splice(veach,0,data); passed = false;};
                        if (veach == this.ViewData.length-1) {this.ViewData.push(data); passed = false;};
                    };
                });
            }
        };

        this.drawPoint = function(P3D,style) {
            var ax=this.Cam.angle.x;var a=P3D.x;var d=this.Cam.position.x;
            var ay=this.Cam.angle.y;var b=P3D.y;var e=this.Cam.position.y;
            var az=this.Cam.angle.z;var c=P3D.z;var f=this.Cam.position.z;
            var x = cos(ay)*cos(az)*(a-d)+cos(ay)*sin(az)*(b-e)-sin(ay)*(c-f);
            var y = sin(ax)*sin(ay)*cos(az)*a-sin(ax)*sin(ay)*cos(az)*d-cos(ax)*sin(az)*a+cos(ax)*sin(az)*d+sin(ax)*sin(ay)*sin(az)*b-e*sin(ax)*sin(ay)*sin(az)+cos(ax)*cos(az)*b-e*cos(ax)*cos(az)+sin(ax)*cos(ay)*(c-f);
            var z = cos(ax)*sin(ay)*cos(az)*a-cos(ax)*sin(ay)*cos(az)*d+sin(ax)*sin(az)*a-sin(ax)*sin(az)*d+cos(ax)*sin(ay)*sin(az)*b-e*cos(ax)*sin(ay)*sin(az)-sin(ax)*cos(az)*b+e*sin(ax)*cos(az)+cos(ax)*cos(ay)*(c-f);
            if (z > 0) z = -sigmoid(z);
            this.DrawQueue({distance:Math.sqrt(Math.pow(a-d,2)+Math.pow(b-e,2)+Math.pow(c-f,2)),draw:"point",position:{x:x,y:y,z:z},style:style});
        };

        this.drawShape = function(P3D4Point,style) {
            var ttp = P3D4Point;
            var center = {x:0,y:0,z:0};
            ttp.forEach((point) => {
                center.x += point.x;center.y += point.y;center.z += point.z;
            });
            center = {x:center.x/ttp.length,y:center.y/ttp.length,z:center.z/ttp.length};
            var vP3D4Point = [];
            ttp.forEach((point,each) => {
                if (each == ttp.length-1) vP3D4Point.push([center,ttp[each],ttp[0]]);
                else vP3D4Point.push([center,ttp[each],ttp[each+1]]);
            });
            //var vP3D4Point = [[ttp[0],ttp[1],ttp[2]],[ttp[2],ttp[3],ttp[0]]];
            vP3D4Point.forEach((vttp) => {
                var distance = 0;
                var positionpoint = [];
                vttp.forEach((P3D) => {
                    var ax=this.Cam.angle.x;var a=P3D.x;var d=this.Cam.position.x;
                    var ay=this.Cam.angle.y;var b=P3D.y;var e=this.Cam.position.y;
                    var az=this.Cam.angle.z;var c=P3D.z;var f=this.Cam.position.z;
                    var x = cos(ay)*cos(az)*(a-d)+cos(ay)*sin(az)*(b-e)-sin(ay)*(c-f);
                    var y = sin(ax)*sin(ay)*cos(az)*a-sin(ax)*sin(ay)*cos(az)*d-cos(ax)*sin(az)*a+cos(ax)*sin(az)*d+sin(ax)*sin(ay)*sin(az)*b-e*sin(ax)*sin(ay)*sin(az)+cos(ax)*cos(az)*b-e*cos(ax)*cos(az)+sin(ax)*cos(ay)*(c-f);
                    var z = cos(ax)*sin(ay)*cos(az)*a-cos(ax)*sin(ay)*cos(az)*d+sin(ax)*sin(az)*a-sin(ax)*sin(az)*d+cos(ax)*sin(ay)*sin(az)*b-e*cos(ax)*sin(ay)*sin(az)-sin(ax)*cos(az)*b+e*sin(ax)*cos(az)+cos(ax)*cos(ay)*(c-f);
                    if (z > 0) z = -0.1;
                    positionpoint.push({x:x,y:y,z:z});
                    var edist = Math.sqrt(Math.pow(a-d,2)+Math.pow(b-e,2)+Math.pow(c-f,2));
                    //if (distance > edist) distance = edist;
                    distance += edist;
                });
                this.DrawQueue({distance:distance/3,draw:"shape",position:positionpoint,style:style});
            });
        };

        
        this.render = function(drawer){
            //vdisdata.reverse();
            //console.log(vdisdata);
            drawer.lineWidth = 0;
            this.ViewData.forEach((data,each) => {
                if (data.draw == "shape") {
                    var canDraw = false;
                    drawer.beginPath();
                    //var cX = 0;var cY = 0;
                    data.position.forEach((vpos,veach) => {
                        var x_r = (vpos.x*2*this.Cam.fov/vpos.z)+window.innerWidth/2;
                        var y_r = (vpos.y*2*this.Cam.fov/vpos.z)+window.innerHeight/2;
                        drawer.lineTo(x_r, y_r);
                        //cX += x_r;cY += y_r;
                        //var rdat = drawer.getImageData(vpos.x,vpos.y,1,1).data;
                        //if ( rdat[0] == 0 && rdat[1] == 0 && rdat[2] == 0) canDraw = true;
                    });
                    drawer.closePath();
                    drawer.fillStyle = data.style;
                    //var rdat = drawer.getImageData(cX/data.position.length,cY/data.position.length,1,1).data;
                    //if ( rdat[0] == 0 && rdat[1] == 0 && rdat[2] == 0) drawer.fill();
                    drawer.fill();
                }
                if (data.draw == "point"){
                    drawer.beginPath();
                    var x_r = (data.position.x*2*this.Cam.fov/data.position.z)+window.innerWidth/2;
                    var y_r = (data.position.y*2*this.Cam.fov/data.position.z)+window.innerHeight/2;
                    drawer.arc(x_r, y_r, 2, 0, 2 * Math.PI);
                    drawer.closePath();
                    drawer.fillStyle = data.style;
                    drawer.fill();
                }
            });
            this.ViewData = [];
        }

        this.CameraMove = function(M3D){
            if (M3D.x != undefined) this.Cam.position.x += M3D.x;
            if (M3D.y != undefined) this.Cam.position.y += M3D.y;
            if (M3D.z != undefined) this.Cam.position.z += M3D.z;
            if (M3D.rotX != undefined) this.Cam.angle.x += M3D.rotX;
            if (M3D.rotY != undefined) this.Cam.angle.y += M3D.rotY;
            if (M3D.rotZ != undefined) this.Cam.angle.z += M3D.rotZ;
            if (Math.abs(this.Cam.angle.x) > 360) this.Cam.angle.x -= 360*((this.Cam.angle.x>0)*2-1);
            if (Math.abs(this.Cam.angle.y) > 360) this.Cam.angle.y -= 360*((this.Cam.angle.y>0)*2-1);
            if (Math.abs(this.Cam.angle.z) > 360) this.Cam.angle.z -= 360*((this.Cam.angle.z>0)*2-1);
        };
    };
};

class Scene {
    constructor(canvas){
        this.canvas = canvas;
        this.gl = this.canvas.getContext("2d");
    
        this.FPS = 0;
        this.val = {};

        /* update code called every frame */
        this.Update = (func) => {
            var reFPS = 0;
            var tick = () => {
                reFPS += 1;
                this.canvas.height = window.innerHeight; this.canvas.width = window.innerWidth;
                this.gl.fillRect(0,0,this.canvas.width,this.canvas.height);
                func(this.gl);
                requestAnimationFrame(tick,this.canvas);
            }
            setInterval(() => {
                this.FPS = reFPS*1;
                reFPS = 0;
            },1000/1);
            requestAnimationFrame(tick,this.canvas);
        };

        this.getFPS = () => {return this.FPS;};

        this.keydown = (func) => {window.addEventListener('keydown',(e) => {
            func(e,this.canvas);
        },false);};

        this.mousedown = (func) => {window.addEventListener('mousedown', (e) => {
            func(e,this.canvas);
        }, false);};

        this.mouseup = (func) => {window.addEventListener('mouseup', (e) => {
            func(e,this.canvas);
        }, false);};

        this.mousemove = (func) => {window.addEventListener('mousemove', (e) => {
            func(e,this.canvas);
        }, false);};
    }
}



// Init
function init(){
    var scene = new Scene(document.getElementById("canvas"));
    var Obj = new Projector({
        position:
            {x:50, y:1000, z:0},
        angle:
            {x:-90, y:90, z:0},
        fov: 180
    });
    scene.val.Obj = Obj;

    /* update code called every frame */
    var cy = -20;
    var cx = 45;
    scene.Update(function(draw) {
        scene.val.Obj.drawShape([
            {x:0, y:500, z:500},
            {x:500, y:500, z:500},
            {x:500, y:0, z:500},
            {x:0, y:0, z:500}
        ],'#02fc1b');

        cy++;
        scene.val.Obj.drawPoint({x:50, y:180, z:0},'#ff4b05');
        scene.val.Obj.drawPoint({x:50-sin(cy)*100, y:180+sin(cx)*(100*0), z:0+cos(cy)*100},'#ff4b05');
        scene.val.Obj.drawPoint({x:50-sin(cy)*200, y:180+sin(cx)*(200*0), z:0+cos(cy)*200},'#ff4b05');
        scene.val.Obj.drawPoint({x:50-sin(cy)*300, y:180+sin(cx)*(300*0), z:0+cos(cy)*300},'#ff4b05');
        scene.val.Obj.drawPoint({x:50-sin(cy)*400, y:180+sin(cx)*(400*0), z:0+cos(cy)*400},'#ff4b05');
        scene.val.Obj.drawPoint({x:50-sin(cy)*500, y:180+sin(cx)*(500*0), z:0+cos(cy)*500},'#ff4b05');
        scene.val.Obj.drawPoint({x:50-sin(cy)*600, y:180+sin(cx)*(600*0), z:0+cos(cy)*600},'#ff4b05');
        scene.val.Obj.drawPoint({x:50-sin(cy)*700, y:180+sin(cx)*(700*0), z:0+cos(cy)*700},'#ff4b05');
        scene.val.Obj.drawPoint({x:50-sin(cy)*800, y:180+sin(cx)*(800*0), z:0+cos(cy)*800},'#ff4b05');

        for (var x = 0; x < 10; x++) {
            for (var y = 0; y < 10; y++) {
                scene.val.Obj.drawShape([
                    {x:(x+1)*600+0, y:(y+1)*600+500, z:0},
                    {x:(x+1)*600+0, y:(y+1)*600+500, z:500},
                    {x:(x+1)*600+500, y:(y+1)*600+500, z:500},
                    {x:(x+1)*600+500, y:(y+1)*600+500, z:0}
                ],'#02fc1b');
                scene.val.Obj.drawShape([
                    {x:(x+1)*600+500, y:(y+1)*600+0, z:500},
                    {x:(x+1)*600+0, y:(y+1)*600+0, z:500},
                    {x:(x+1)*600+0, y:(y+1)*600+0, z:0},
                    {x:(x+1)*600+500, y:(y+1)*600+0, z:0}
                ],'#fc0202');
                scene.val.Obj.drawShape([
                    {x:(x+1)*600+500, y:(y+1)*600+0, z:500},
                    {x:(x+1)*600+500, y:(y+1)*600+500, z:500},
                    {x:(x+1)*600+0, y:(y+1)*600+500, z:500},
                    {x:(x+1)*600+0, y:(y+1)*600+0, z:500}
                ],'#ebfc02');
                scene.val.Obj.drawShape([
                    {x:(x+1)*600+0, y:(y+1)*600+0, z:0},
                    {x:(x+1)*600+0, y:(y+1)*600+0, z:500},
                    {x:(x+1)*600+0, y:(y+1)*600+500, z:500},
                    {x:(x+1)*600+0, y:(y+1)*600+500, z:0}
                ],'#02adfc');
                scene.val.Obj.drawShape([
                    {x:(x+1)*600+500, y:(y+1)*600+0, z:0},
                    {x:(x+1)*600+500, y:(y+1)*600+500, z:0},
                    {x:(x+1)*600+0, y:(y+1)*600+500, z:0},
                    {x:(x+1)*600+0, y:(y+1)*600+0, z:0}
                ],'#0217fc');
                scene.val.Obj.drawShape([
                    {x:(x+1)*600+500, y:(y+1)*600+0, z:0},
                    {x:(x+1)*600+500, y:(y+1)*600+500, z:0},
                    {x:(x+1)*600+500, y:(y+1)*600+500, z:500},
                    {x:(x+1)*600+500, y:(y+1)*600+0, z:500}
                ],'#fc02e3');
            }
        }

        scene.val.Obj.render(draw);
        draw.fillStyle = '#ffffff';
        draw.font = "15px Arial";
        draw.fillText("FPS:"+scene.getFPS().toString(),0,10);
        draw.fillText(JSON.stringify(scene.val.Obj.Cam.position),0,45);
        draw.fillText(JSON.stringify(scene.val.Obj.Cam.angle),0,65);
        // scene.val.Obj.drawPoint({x:200, y:100, z:200},draw);
        // scene.val.Obj.drawPoint({x:100, y:100, z:200},draw);
        // scene.val.Obj.drawPoint({x:100, y:200, z:200},draw);
        // scene.val.Obj.drawPoint({x:200, y:200, z:200},draw);
    });

    /* update code called every keypressed */
    scene.keydown(function(e) {
        var keydown = String.fromCharCode(e.keyCode);
        console.log(keydown);
        if (keydown == "W"){
            var x = scene.val.Obj.Cam.angle.x;
            var y = scene.val.Obj.Cam.angle.y;
            scene.val.Obj.CameraMove({x:-sin(y)*20});
            //scene.val.Obj.CameraMove({y:sin(x)*20});
            scene.val.Obj.CameraMove({z:-cos(y)*20});
        };
        if (keydown == "S"){
            var x = scene.val.Obj.Cam.angle.x;
            var y = scene.val.Obj.Cam.angle.y;
            scene.val.Obj.CameraMove({x:sin(y)*20});
            //scene.val.Obj.CameraMove({y:-sin(x)*20});
            scene.val.Obj.CameraMove({z:cos(y)*20});
        };
        if (keydown == "D"){
            var z = scene.val.Obj.Cam.angle.z;
            var y = scene.val.Obj.Cam.angle.y;
            scene.val.Obj.CameraMove({x:-cos(y)*20});
            scene.val.Obj.CameraMove({y:sin(z)*20});
            scene.val.Obj.CameraMove({z:sin(y)*20});
        };
        if (keydown == "A"){
            var z = scene.val.Obj.Cam.angle.z;
            var y = scene.val.Obj.Cam.angle.y;
            scene.val.Obj.CameraMove({x:cos(y)*20});
            scene.val.Obj.CameraMove({y:sin(z)*20});
            scene.val.Obj.CameraMove({z:-sin(y)*20});
        };
        if (keydown == " "){scene.val.Obj.CameraMove({y:20})};
        if (keydown == "("){scene.val.Obj.CameraMove({y:-20})};
        if (keydown == "Q"){scene.val.Obj.CameraMove({rotZ:-1})};
        if (keydown == "E"){scene.val.Obj.CameraMove({rotZ:1})};
        if (keydown == "C"){scene.val.Obj.fov = 360};
        if (keydown == "X"){scene.val.Obj.fov = 45};
    });

    /* update code called every mouse pressed */
    scene.mousedown(function(e) {
        console.log(e);
    });

    /* update code called every mouse released */
    scene.mouseup(function(e) {
        console.log(e);
    });

    scene.mousemove(function(e,canvas) {
        if (e.buttons == 1) {
            canvas.requestPointerLock();
            scene.val.Obj.CameraMove({rotY:e.movementX/10});
            scene.val.Obj.CameraMove({rotX:-e.movementY/10});
            if (scene.val.Obj.Cam.angle.x < -90) scene.val.Obj.Cam.angle.x = -90;
            if (scene.val.Obj.Cam.angle.x > 90) scene.val.Obj.Cam.angle.x = 90;
        }
    });
}

document.addEventListener("DOMContentLoaded", init, false);