Phaser.Point.prototype.originAngle = function() {
    return Math.atan2(this.y, this.x);
};

var Heap = (function () {
    /**
     * @param {function} cmp - the comparison function, returns true when the
     * first argument should go before the second one
     */
    var Heap = function (cmp) {
        this.cmp = cmp || function(a, b) {
            return a < b;
        };
        this.arr = [];
    };

    Heap.prototype.empty = function() {
        return this.arr.length === 0;
    };
    Heap.prototype.size = function() {
        return this.arr.length;
    };

    Heap.prototype.top = function() {
        return this.arr[0];
    };

    
    function swapElm(i, j) {
        var tmp = this.arr[i];
        this.arr[i] = this.arr[j];
        this.arr[j] = tmp;

        this.arr[i].heapInd = i;
        this.arr[j].heapInd = j;
    }

    Heap.prototype.pop = function(pInd) {
        var tmp,
            ind = pInd || 0,
            lessI;

        while (ind > 0) {
            lessI = Math.floor((ind + 1) * 0.5 - 1);

            swapElm.call(this, ind, lessI);
            ind = lessI;
        }

        swapElm.call(this, 0, this.arr.length - 1);
        this.arr.pop();

        while ((ind + 1) * 2 <= this.arr.length) {
            lessI = (ind + 1) * 2 - 1;

            if ((lessI + 1 < this.arr.length) && 
                    (this.cmp(this.arr[lessI + 1], this.arr[lessI]))) {
                lessI++;
            }
            if (this.cmp(this.arr[lessI], this.arr[ind])) {
                swapElm.call(this, lessI, ind);

                ind = lessI;
            } else {
                break;
            }
        }
    };

    Heap.prototype.push = function(elm) {
        var ind = this.arr.length,
            par,
            tmp;

        elm.heapInd = this.arr.length;
        this.arr.push(elm);

        while (ind > 0) {
            par = Math.floor((ind  + 1) * 0.5 - 1);
            if (this.cmp(this.arr[ind], this.arr[par])) {
                swapElm.call(this, par, ind);
                ind = par;
            } else {
                break;
            }
        }
    };

    return Heap;
}) ();

var Lighting = (function () {
    var EPS = 0.01;
    var Lighting = function(map) {
        this.lights = [];
        this.humans = [];
        this.dynamicWalls = [];
        this.group = game.add.group();

        if (map) {
            buildWalls.call(this, map);
            createBounds.call(this, map);
            createFilter.call(this, map);
        }
    };

    function createFilter(map) {
        var x = 0, 
            y = 0;

        this.filter = game.add.graphics(game.camera.x, game.camera.y);
        this.filter.blendMode = Phaser.blendModes.MULTIPLY;

        this.filter.beginFill(Conf.Lighting.shadowColor);
        this.filter.drawRect(0, 0, map.widthInPixels, map.heightInPixels);
        this.filter.endFill();

        this.group.add(this.filter);
    }

    function isWall(cur,  adj) {
        return cur.properties.opaque - adj.properties.opaque;
    }
    function addHorWall(str, end) {
        this.walls.push(new Phaser.Line(
                str.left, str.top, end.right, end.top));
    }
    function addVertWall(str, end) {
        this.walls.push(new Phaser.Line(
                str.left, str.top, end.left, end.bottom));
    }
    function setOpaque(map) {
        var x = 0,
            y = 0,
            opaque = new Set(Conf.opaqueTiles),
            curTile = null;

        for (x = 0;x < map.width;x++) {
            for (y = 0;y < map.height;y++) {
                curTile = map.getTile(x, y);
                curTile.properties.opaque = opaque.has(curTile.index);
            }
        }
    }
    function addLevelWalls(map) {
        var x = 0,
            y = 0,
            prevWall = 0,
            curWall = 0,
            startTile = null,
            curTile = null,
            prevTile = null,
            adjTile = null;

        // horizontal
        for (y = 1;y < map.height;y++) {
            startTile = null;
            prevTile = null;
            prevWall = 0;

            for (x = 0;x < map.width;x++) {
                curTile = map.getTile(x, y);
                adjTile = map.getTile(x, y - 1);
                curWall = isWall(curTile, adjTile);

                if (curWall != prevWall) {
                    if (prevWall) {
                        addHorWall.call(this, startTile, prevTile);
                        startTile = null;
                    }
                    if (curWall) {
                        startTile = curTile;
                    }
                }

                prevTile = curTile;
                prevWall = isWall(curTile, adjTile);
            }
            if (startTile) {
                addHorWall.call(this, startTile, prevTile);
            }
        }

        // vertical
        for (x = 1;x < map.width;x++) {
            startTile = null;
            prevTile = null;
            prevWall = 0;


            for (y = 0;y < map.height;y++) {
                curTile = map.getTile(x, y);
                adjTile = map.getTile(x - 1, y);
                curWall = isWall(curTile, adjTile);

                if (curWall != prevWall) {
                    if (prevWall) {
                        addVertWall.call(this, startTile, prevTile);
                        startTile = null;
                    }
                    if (curWall) {
                        startTile = curTile;
                    }
                }

                prevTile = curTile;
                prevWall = curWall;
            }
            if (startTile) {
                addVertWall.call(this, startTile, prevTile);
            }
        }
    }
    function createBounds(map) {
        var maxW = map.widthInPixels;
        var maxH = map.heightInPixels;

        this.bounds = [
            new Phaser.Line(0, 0, 0, maxH),
            new Phaser.Line(0, 0, maxW, 0),
            new Phaser.Line(0, maxH, maxW, maxH),
            new Phaser.Line(maxW, 0, maxW, maxH)];
    }
    Lighting.prototype.addLight = function(pLight) {
        pLight.lighting = this;
        this.lights.push(pLight);
        this.group.add(pLight.lightArea);
    };
    function buildWalls(map) {
        this.walls = [];

        setOpaque.call(this, map);
        addLevelWalls.call(this, map);
    }
    function updateWalls() {
        var i = 0,
            body,
            topLeft = null,
            topRight = null,
            botLeft = null,
            botRight = null;

        this.walls.length -= this.dynamicCnt;


        this.dynamicCnt = 4 * this.humans.length;
    }
    Lighting.prototype.update = function() {
        //updateWalls.call(this);
    };

    Lighting.prototype.intersectRay = function(ray, walls) {
        var i = 0,
            bestIntersect = ray.end,
            bestDist = Infinity,
            curDist = Infinity,
            cur = new Phaser.Point();

        ray.end.subtract(ray.start.x, ray.start.y)
                .multiply(1000, 1000)
                .add(ray.start.x, ray.start.y);

        if (!walls) {
            walls = this.walls;
        }    

        for (i = 0;i < walls.length;i++) {
            cur = Phaser.Line.intersects(walls[i], ray);
            if (cur) {
                curDist = cur.subtract(ray.start.x, ray.start.y).
                        getMagnitudeSq();
                if (curDist < bestDist) {
                    bestDist = curDist;
                    bestIntersect = cur.add(ray.start.x, ray.start.y);
                }
            }
        }
        return bestIntersect;
    };

    function segmentCmp(a, b) {
        var maxStart = Math.max(a.start.originAngle(), b.start.originAngle()),
            minEnd = Math.min(a.end.originAngle(), b.end.originAngle()),
            medAngle = (minEnd + maxStart) * 0.5,
            ray = new Phaser.Line(0, 0, 1, 0).rotateAround(0, 0, medAngle);

        return (ray.intersects(a, false).getMagnitudeSq() <
            ray.intersects(b, false).getMagnitudeSq());
    }
    function normSeg(seg, x, y, rect, ans) {
        if (!ans) {
            ans = [];
        }
        var tmp = null,
            vertRay = null;

        seg.start.subtract(x, y);
        seg.end.subtract(x, y);
            
        if (rect) {
            if ((seg.right < rect.left) || (seg.left > rect.right)) {
                return ans;
            }
            if ((seg.top > rect.bottom) || (seg.bottom < rect.top)) {
                return ans;
            }

        }

        if (seg.start.originAngle() > seg.end.originAngle()) {
            seg.start = [seg.end, seg.end = seg.start][0];
        }
        
        if (seg.end.originAngle() - seg.start.originAngle() > Math.PI) { 
            vertRay = new Phaser.Line(0, 0, -1, 0);
            tmp = vertRay.intersects(seg, false);

            ans.push(new Phaser.Line(seg.end.x, seg.end.y, tmp.x, tmp.y));
            ans.push(new Phaser.Line(tmp.x, tmp.y - Number.EPSILON,
                                          seg.start.x, seg.start.y));
        } else {
            ans.push(seg);
        }
        return ans;
    }
    function getSegments(x, y, rect) {
        var i = 0,
            j = 0,
            segments = [],
            bodySides = null;

        if (rect) {
            rect.x -= x;
            rect.y -= y;
        }

        for (i = 0;i < this.bounds.length;i++) {
            normSeg(this.bounds[i].clone(), x, y, null, segments);
        }

        for (i = 0;i < this.humans.length;i++) {
            bodySides = this.humans[i].getBodySides();
            for (j = 0;j < bodySides.length;j++) {
                normSeg(bodySides[j], x, y, rect, segments);
            }
        }

        for (i = 0;i < this.walls.length;i++) {
            normSeg(this.walls[i].clone(), x, y, rect, segments);
        }
        //console.log(segments);
        
        for (i = 0;i < segments.length;i++) {
            segments[i].inRange = false;
            segments[i].seg = i;
        }

        return segments;
    }
    function getSegEnds(segments) {
        var i = 0,
            segEnds = [];

        for(i = 0;i < segments.length;i++) {
            segEnds[2 * i] = segments[i].start;
            segEnds[2 * i].isStart = true;
            segEnds[2 * i].segInd = segments[i].seg;
            segEnds[2 * i].seg = segments[i];

            segEnds[2 * i + 1] = segments[i].end;
            segEnds[2 * i + 1].isStart = false;
            segEnds[2 * i + 1].segInd = segments[i].seg;
            segEnds[2 * i + 1].seg = segments[i];
        }

        segEnds = segEnds.sort(function (a, b) {
            if (Math.abs(a.originAngle() - b.originAngle()) < Number.EPSILON) {
                return (a.isStart && !b.isStart) ? -1 : 1;
            } else {
                return a.originAngle() < b.originAngle() ? -1 : 1;
            }
        });

        return segEnds;
    }
    Lighting.prototype.visiblePolygon = function(x, y, rect) {
        var segments = getSegments.call(this, x, y, rect),
            segEnds = getSegEnds.call(this, segments),
            curSeg = segEnds[0].seg,
            curStart = curSeg.start,
            awns = [],
            closestSeg = new Heap(segmentCmp),
            ray = null,
            i = 0,
            j = 0;

        curSeg.inRange = true;
        closestSeg.push(curSeg);

        var avgHeapD = 0;

        for (i = 1;i < segEnds.length;i++) {
            if (segEnds[i].isStart) {
                if (Math.abs(segEnds[i].seg.end.originAngle() -
                             segEnds[i].originAngle()) > 0.01) {


                    segEnds[i].seg.inRange = true;
                    closestSeg.push(segEnds[i].seg);
                 }
            } else {
                if (segEnds[i].seg.inRange) {
                    segEnds[i].seg.inRange = false;
                    closestSeg.pop(segEnds[i].seg.heapInd);
                }
            }

            avgHeapD += closestSeg.size();

            if (closestSeg.top() !== curSeg) {
                ray = new Phaser.Line(0, 0, 1, 0);
                ray.rotateAround(0, 0, segEnds[i].originAngle());

                awns.push(curStart);
                awns.push(ray.intersects(curSeg, false));

                if (!closestSeg.empty()) {
                    curSeg = closestSeg.top();
                    curStart = ray.intersects(curSeg, false);
                }
            }
        }



        for (i = 0;i < awns.length;i++) {
            awns[i] = new Phaser.Point(awns[i].x + x, awns[i].y + y);
        }

        return new Phaser.Polygon(awns);
    };

    return Lighting;
}) ();


var Light = (function() {
    var Light = function(x, y, fov, range, offset) {
        this.x = x || 0;
        this.y = y || 0;
        this.fov = fov || Math.PI * 0.25;
        this.range = (range || 2) * Conf.tileSize;
        offset = offset * Conf.tileSize || 0;
        this.offset = offset;

        this.lightArea = game.add.graphics(this.x, this.y);

        this.lightArea.beginFill(0xFFFFFF);
        this.lightArea.arc(0, 0, this.range, -this.fov * 0.5, this.fov * 0.5);

        this.lightArea.drawPolygon([
            new Phaser.Point(offset, -Math.tan(this.fov * 0.5) * offset),
            new Phaser.Point(this.range, 0).rotate(0, 0, -this.fov * 0.5),
            new Phaser.Point(this.range, 0).rotate(0, 0, this.fov * 0.5),
            new Phaser.Point(offset, Math.tan(this.fov * 0.5) * offset)
        ]);

        //this.lightArea.drawRect(-10000, -10000, 20000, 20000);
        this.lightArea.endFill();

        this.lightArea.blendMode = Phaser.blendModes.SCREEN;
        this.lightArea.mask = game.add.graphics(0, 0);

        this.lightArea.tint = Conf.Lighting.lightColor;
        
        this.visiblePolygon = new Phaser.Polygon();
    };

    Light.prototype.cast = function() {
        var castPoint = new Phaser.Point(this.x + this.offset, this.y).
                                rotate(this.x, this.y, this.rotation),
            rangeWorld = Conf.Guard.range * Conf.tileSize,
            rect = new Phaser.Rectangle(castPoint.x - rangeWorld, 
                                        castPoint.y - rangeWorld,
                                        2 * rangeWorld,
                                        2 * rangeWorld);

        this.lightArea.x = this.x;
        this.lightArea.y = this.y;
        this.lightArea.rotation = this.rotation;

        // the whole Light is outside of the camera
        if (!game.camera.view.intersects(rect)) {
            return;
        }

        this.visiblePolygon = this.lighting.visiblePolygon(castPoint.x,
                                                    castPoint.y, rect);
        this.lightArea.mask.clear();
        this.lightArea.mask.beginFill(0xFFFFFF);
        for (var i = 0;i < 15;i++) {
            this.lightArea.mask.drawShape(this.visiblePolygon);
        }
    };

    Light.prototype.pointVisible = function(point) {
        var cent = new Phaser.Point(this.x, this.y),
            angle = cent.angle(point) - this.rotation;

        if (angle > Math.PI) {
            angle -= 2 * Math.PI;
        }
        angle = Math.abs(angle);

        if (point.distance(cent) > this.range) {
            return false;
        } else if (angle > this.fov * 0.5) {
            return false;
        } else if (!this.visiblePolygon.contains(point.x, point.y)) {
            return false;
        } else {
            return true;
        }
    };

   return Light;
}) ();
