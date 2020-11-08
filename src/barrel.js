import * as Matter from "matter-js";

// create engine
const engine = Matter.Engine.create({
    positionIterations: 4,
    velocityIterations: 3
});
const world = engine.world;

const palette = ["#B50116", "#60D94A", "#3A09CA", "#FAAD22"];

export function initBarrel(a) {
    const worldSize = {w: a*2, h: a*2};
    const barrel = {
        cx: worldSize.w/2,
        cy: worldSize.h/2,
        r: a,
        n: 6,
        friction: 0.8
    };

    const ri = barrel.r*Math.cos(Math.PI/barrel.n);

    function makeBarrel(cx, cy, r, n) {
        const da = 2*Math.PI/n;
        const l = 2*r*Math.sin(Math.PI/n);
        const result = [];
        for(let i=0, a=-Math.PI; i<n; i++, a+=da) {
            const x = cx + ri*Math.cos(a);
            const y = cy + ri*Math.sin(a);
            const ang = a - Math.PI/2;
            const rect = Matter.Bodies.rectangle(x, y, l, 10, { isStatic: true, angle: ang, render: { visible: false } });
            result.push(rect);
        }
        return result;
    }

    const stack = Matter.Composites.stack(barrel.cx-ri*0.7, barrel.cy-ri*0.7, 8, 8, 0, 0, function (x, y) {
        let sides = Math.round(Matter.Common.random(4, 8));
        return Matter.Bodies.polygon(x, y, sides, Matter.Common.random(4, 16), {
            friction: 1,
            frictionStatic: Infinity,
            render: {
                fillStyle: `rgb(${Matter.Common.random(5, 255)} ${Matter.Common.random(5, 255)} ${Matter.Common.random(5, 255)})`
                //fillStyle: Matter.Common.choose(palette)
            }
        });
    });
    const zone = makeBarrel(barrel.cx, barrel.cy, barrel.r, barrel.n);

    Matter.World.add(world, zone);
    Matter.World.add(world, stack);

    let ao = 0;
    let ao_changed = false;
    let step = 0;
    Matter.Events.on(engine, 'beforeUpdate', function(event) {
        if(ao_changed) {
            if(step < 2) {
                //console.log(step);
                const da = 2.0 * Math.PI / barrel.n;
                const ri = barrel.r * Math.cos(Math.PI / barrel.n);
                let a = -Math.PI + ao;
                for (const rect of zone) {
                    const x = barrel.cx + ri * Math.cos(a);
                    const y = barrel.cy + ri * Math.sin(a);
                    const ang = a - Math.PI / 2;
                    Matter.Body.setVelocity(rect, {x: x - rect.position.x, y: y - rect.position.y});
                    //Matter.Body.setAngularVelocity(rect, ang - rect.angle);
                    Matter.Body.setPosition(rect, {x, y});
                    Matter.Body.setAngle(rect, ang);
                    a += da;
                }
                step += 1;
            }
            else {
                ao_changed = false;
            }
        }
    });

    return  {
        start: function() {
            // create runner
            const runner = Matter.Runner.create();
            Matter.Runner.run(runner, engine);
        },
        rotate: function(angle) {
            ao = angle;
            ao_changed = true;
            step = 0;
        },
        render: function(context) {
                var c = context,
                    bodies = Matter.Composite.allBodies(world),
                    body,
                    part,
                    i,
                    k;

                for (i = 0; i < bodies.length; i++) {
                    body = bodies[i];

                    if (!body.render.visible)
                        continue;

                    // handle compound parts
                    for (k = body.parts.length > 1 ? 1 : 0; k < body.parts.length; k++) {
                        part = body.parts[k];

                        if (!part.render.visible)
                            continue;

                        if (part.render.opacity !== 1) {
                            c.globalAlpha = part.render.opacity;
                        }

                        // part polygon
                        if (part.circleRadius) {
                            c.beginPath();
                            c.arc(part.position.x, part.position.y, part.circleRadius, 0, 2 * Math.PI);
                        } else {
                            c.beginPath();
                            c.moveTo(part.vertices[0].x, part.vertices[0].y);

                            for (var j = 1; j < part.vertices.length; j++) {
                                if (!part.vertices[j - 1].isInternal) {
                                    c.lineTo(part.vertices[j].x, part.vertices[j].y);
                                } else {
                                    c.moveTo(part.vertices[j].x, part.vertices[j].y);
                                }

                                if (part.vertices[j].isInternal) {
                                    c.moveTo(part.vertices[(j + 1) % part.vertices.length].x, part.vertices[(j + 1) % part.vertices.length].y);
                                }
                            }

                            c.lineTo(part.vertices[0].x, part.vertices[0].y);
                            c.closePath();
                        }

                        c.fillStyle = part.render.fillStyle;

                        if (part.render.lineWidth) {
                            c.lineWidth = part.render.lineWidth;
                            c.strokeStyle = part.render.strokeStyle;
                            c.stroke();
                        }

                        c.fill();
                        c.globalAlpha = 1;
                    }
                }
            }
    }
}