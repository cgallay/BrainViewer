import React, { useState } from 'react';

import 'antd/dist/antd.css';
import './App.css';
import BrainView from './components/BrainView'
import { data2numjs } from './helper.js'
import { Slider, Spin, Upload, InputNumber, Checkbox, Card, Row, Col } from 'antd';
import ReactGA from 'react-ga';
ReactGA.initialize('UA-158864251-1');
ReactGA.pageview(window.location.pathname + window.location.search);

const { Dragger } = Upload;


function App() {
  const [isLoad, setIsLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [imageArray, setImage] = useState(null);
  const [powerValue, setPowerValue] = useState(1)
  const [selectedMap, setSelectedMapCheckbox] = useState(["Brain"])
  var fileLoader = (file) => {
    setIsLoading(true)
    var reader = new FileReader();
    reader.onloadend = function (data) {
      const [img, metaInfo] = data2numjs(reader.result)
      setImage(img)
      setIsLoading(false)
      setIsLoaded(true)
    }
    reader.readAsArrayBuffer(file);

  }

  return (
    <div className="App">
      {!isLoad ?
        <Spin tip="Loading..." spinning={isLoading} size={'large'}>
          <Dragger showUploadList={false} action={fileLoader} customRequest={() => null}>
            <div className='custom-dragger'>
              <img src={require('./brain_icon.svg')} height={100} width={100} />
              <br />
              <br />
              <p className="ant-upload-text">Click or drag image to this area for visualization.</p>
            </div>
          </Dragger>
        </Spin> :
        <div>
          <Row>
            <Col span={18}>
              <BrainView imageArray={imageArray} attentionScale={powerValue} selectedMap={selectedMap} attentionMapCallback={() => setSelectedMapCheckbox(selectedMap.concat(["Attention Map"]))}></BrainView>
            </Col>
            <Col span={6}>
              <Card title="Control Panel">
                <Slider
                  min={1}
                  max={10}
                  onChange={setPowerValue}
                  value={typeof powerValue === 'number' ? powerValue : 0}
                  step={1}
                ></Slider>
                <InputNumber
                  min={1}
                  max={10}
                  step={1}
                  value={powerValue}
                  onChange={setPowerValue}
                />

                <Checkbox.Group options={['Brain', 'Attention Map']} value={selectedMap} onChange={setSelectedMapCheckbox} />
              </Card>
            </Col>
          </Row>

        </div>}

    </div>
  );
}

export default App;
