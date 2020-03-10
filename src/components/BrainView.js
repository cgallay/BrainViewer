import React, { useState, useEffect, useRef } from 'react';
import * as d3 from 'd3'
import { Card, Progress, Icon } from 'antd'
import Dragger from 'antd/lib/upload/Dragger';
import { data2numjs } from '../helper.js'



function BrainView({ imageArray, attentionScale, selectedMap, attentionMapCallback}) {

    const canvas1Ref = useRef(null);
    const canvas2Ref = useRef(null);
    const canvas3Ref = useRef(null);
    const [attentionMap, setAttentionMap] = useState(null)
    const [metaInfo, setMetaInfo] = useState(null)
    const [currentSlice, setCurrentSlice] = useState([90, 120, 120])
    const imgShape = [182, 218, 182]
    const w = 400
    const imgShapePixel = [w, Math.round((w / imgShape[0]) * imgShape[1]), Math.round((w / imgShape[0]) * imgShape[2])]
    console.log(imgShapePixel)
    var attentionLoader = (file) => {
        //setIsLoading(true)
        var reader = new FileReader();
        reader.onloadend = function (data) {
            const [attention, meta] = data2numjs(reader.result)
            setMetaInfo(meta)
            setAttentionMap(attention)
        }
        reader.readAsArrayBuffer(file);
        attentionMapCallback()

    }

    useEffect(() => {
        var color = d3.interpolateTurbo
        function drawSlice(canvas, imageData, slice, axis) {
            var image_max_value = imageData.max()
            var l = 0
            if (axis == 0) {
                var xMax = imgShape[1]
                var yMax = imgShape[2]
            } else if (axis == 2) {
                var xMax = imgShape[0]
                var yMax = imgShape[1]
            } else {
                var xMax = imgShape[0]
                var yMax = imgShape[2]
            }
            var context = canvas.node().getContext("2d"), image = context.createImageData(yMax, xMax);
            for (var i = 0; i < xMax; ++i) {
                for (var j = 0; j < yMax; ++j) {
                    var args = [i, j]
                    args.splice(axis, 0, slice)
                    image.data[l + 0] = (imageData.get(...args) / image_max_value) * 255;
                    image.data[l + 1] = (imageData.get(...args) / image_max_value) * 255;
                    image.data[l + 2] = (imageData.get(...args) / image_max_value) * 255;
                    image.data[l + 3] = 255
                    l = l + 4
                }
            }
            context.putImageData(image, 0, 0);
        }

        function drawAttention(canvas, attentionData, slice, axis) {
            var image_min_value = attentionData.min()
            var image_max_value = attentionData.max()
            var l = 0
            if (axis == 0) {
                var xMax = imgShape[1]
                var yMax = imgShape[2]
            } else if (axis == 2) {
                var xMax = imgShape[0]
                var yMax = imgShape[1]
            } else {
                var xMax = imgShape[0]
                var yMax = imgShape[2]
            }
            var overlayCanvas = document.createElement("canvas");
            overlayCanvas = d3.select(overlayCanvas)
                .attr("width", yMax)
                .attr("height", xMax);
            var context = overlayCanvas.node().getContext("2d"), image = context.getImageData(0, 0, yMax, xMax);
            for (var i = 0; i < xMax; ++i) {
                for (var j = 0; j < yMax; ++j) {
                    var args = [i, j]
                    args.splice(axis, 0, slice)
                    var pixelValue = (attentionData.get(...args) - image_min_value) / (image_max_value - image_min_value)
                    if (attentionScale !== null) {
                        pixelValue = pixelValue ** attentionScale
                    }
                    var c = d3.rgb(color(pixelValue));
                    image.data[l + 0] = c.r
                    image.data[l + 1] = c.g
                    image.data[l + 2] = c.b
                    image.data[l + 3] = 100
                    l = l + 4
                }
            }
            context.putImageData(image, 0, 0);
            canvas.node().getContext("2d").drawImage(overlayCanvas.node(), 0, 0)
        }
        function draw() {
            console.log("Drawing")
            if (imageArray !== null && selectedMap.includes("Brain")) {
                drawSlice(canvas1, imageArray, currentSlice[0], 0)
                drawSlice(canvas2, imageArray, currentSlice[2], 2)
                drawSlice(canvas3, imageArray, currentSlice[1], 1)
            }
            if (attentionMap && selectedMap.includes("Attention Map")) {
                drawAttention(canvas1, attentionMap, currentSlice[0], 0)
                drawAttention(canvas2, attentionMap, currentSlice[2], 2)
                drawAttention(canvas3, attentionMap, currentSlice[1], 1)
            }

        }

        var canvas1 = d3.select(canvas1Ref.current)
            .attr("width", imgShape[0])
            .attr("height", imgShape[1]);
        var canvas2 = d3.select(canvas2Ref.current)
            .attr("width", imgShape[1])
            .attr("height", imgShape[2]);
        var canvas3 = d3.select(canvas3Ref.current)
            .attr("width", imgShape[0])
            .attr("height", imgShape[2]);
        canvas1.on("click", function () {
            var cordY = Math.round((d3.event.offsetY / imgShapePixel[1]) * imgShape[1])
            var cordX = Math.round((d3.event.offsetX / imgShapePixel[0]) * imgShape[0])
            currentSlice[1] = cordY
            currentSlice[2] = cordX
            setCurrentSlice(currentSlice)
            draw()
        })
        canvas2.on("click", function () {
            var cordY = Math.round((d3.event.offsetY / imgShapePixel[2]) * imgShape[2])
            var cordX = Math.round((d3.event.offsetX / imgShapePixel[1]) * imgShape[1])
            currentSlice[0] = cordY
            currentSlice[1] = cordX
            setCurrentSlice(currentSlice)
            draw()
        })
        canvas3.on("click", function () {
            var cordY = Math.round((d3.event.offsetY / imgShapePixel[0]) * imgShape[0])
            var cordX = Math.round((d3.event.offsetX / imgShapePixel[2]) * imgShape[2])
            currentSlice[0] = cordY
            currentSlice[2] = cordX
            setCurrentSlice(currentSlice)
            draw()
        })
        //console.log(attentionMap)

        draw()

    }, [imageArray, attentionMap, attentionScale, selectedMap])

    return (<div><table style={{ 'background-color': 'black', 'border': 0, 'cellspacing': 0 }}>
        <tr>
            <td>
                <canvas ref={canvas3Ref} style={{ width: imgShapePixel[0] }}></canvas>
            </td>
            <td>
                <canvas ref={canvas2Ref} style={{ width: imgShapePixel[1] }}></canvas>
            </td>
        </tr>
        <tr>
            <td>
                <canvas ref={canvas1Ref} style={{ width: imgShapePixel[2] }}></canvas>
            </td>
            <td>
                {attentionMap === null ?
                    <div style={{ height: 200, width: 200, textAlign: "center", margin: "auto" }}>

                        <Dragger
                            showUploadList={false}
                            action={attentionLoader}
                            customRequest={() => null}
                        >
                            <Icon type="plus" style={{ 'fontSize': 50 }} />
                            <br />
                            <br />
                            <p className="ant-upload-hint">Click or drag attention map to this area for visualization.</p>

                        </Dragger>
                    </div>
                    :
                    <div>
                        {Object.keys(metaInfo).length === 0 ? "" :
                            <div style={{ padding: "60px" }}>
                                <Card>
                                    <Progress type="dashboard" percent={Math.round(metaInfo.pred * 100)} />
                                    <p>Dementia prediction</p>
                                    <p>Ground truth is {metaInfo.label === 1 ? "Dementia" : "Control"}</p>
                                </Card>
                            </div>
                        }
                    </div>
                }
            </td>
        </tr>
    </table>
    </div>)
}

export default BrainView
