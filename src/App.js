import React, { Component } from "react";
import "./App.css";
import Webcam from "react-webcam";
import Tesseract from "tesseract.js";
import { b64toBlob } from "./utils";

const VIDEOCONSTRAINTS = {
  width: 1280,
  height: 720,
  facingMode: "user"
};
class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isCameraEnabled: false,
      isLoading: false,
      uploads: [],
      patterns: [],
      documents: []
    };
  }

  //reference to the webcam onclick of capture

  setRef = webcam => {
    this.webcam = webcam;
  };

  //captures images from webcam and generated its objectURL

  capture = () => {
    if (this.state.isCameraEnabled) {
      const imageSrc = this.webcam.getScreenshot();
      let arrImage = [];
      let base64result = imageSrc.split(",")[1];
      const blob = b64toBlob(base64result, "image/png");
      const blobUrl = URL.createObjectURL(blob);
      arrImage.push(blobUrl);
      this.setState({ uploads: arrImage });
    } else {
      this.setState({ isCameraEnabled: true });
    }
  };

  //uploads image files

  handleChange = event => {
    if (event.target.files[0]) {
      var uploads = [];
      for (var key in event.target.files) {
        if (!event.target.files.hasOwnProperty(key)) continue;
        let upload = event.target.files[key];
        uploads.push(URL.createObjectURL(upload));
      }
      this.setState({
        uploads: uploads
      });
    } else {
      this.setState({
        uploads: []
      });
    }
  };

  //Generate or extract text from given image

  generateText = () => {
    let uploads = this.state.uploads;
    for (var i = 0; i < uploads.length; i++) {
      Tesseract.recognize(uploads[i], {
        lang: "eng"
      })
        .catch(err => {
          console.error(err);
        })
        .then(result => {
          // Get Confidence score
          let confidence = result.confidence;
          // Get full output
          let text = result.text;
          // Get codes
          let pattern = /\b\w{10,10}\b/g;
          let patterns = result.text.match(pattern);
          // Update state
          this.setState({
            isLoading: false,
            patterns: this.state.patterns.concat(patterns),
            documents: this.state.documents.concat({
              pattern: patterns,
              text: text,
              confidence: confidence
            })
          });
        });
    }
  };
  handleLoading = () => {
    this.setState({ isLoading: true });
    this.generateText();
  };
  handleCameraClose = () => {
    this.setState({ isCameraEnabled: false });
  };
  render() {
    const { isCameraEnabled, isLoading } = this.state;
    return (
      <div className="app">
        <header className="header">
          <h1>Text Extractor</h1>
        </header>
        <div className="cameraContainer">
          {isCameraEnabled && (
            <Webcam
              className="webCam"
              audio={false}
              height={350}
              ref={this.setRef}
              screenshotFormat="image/jpeg"
              width={350}
              videoConstraints={VIDEOCONSTRAINTS}
              screenshotQuality={10}
            />
          )}
          {isCameraEnabled && (
            <div>
              <button className="closeCamera" onClick={this.handleCameraClose}>
                close
              </button>
            </div>
          )}
          <button onClick={this.capture} className="button">
            {isCameraEnabled ? "Capture photo!" : "Access camera!"}
          </button>
        </div>
        {/* File uploader */}
        <section className="hero">
          <label className="fileUploaderContainer">
            Click here to upload Image
            <input
              type="file"
              id="fileUploader"
              onChange={this.handleChange}
              multiple
            />
          </label>

          <div>
            {this.state.uploads.map((value, index) => {
              return <img key={index} src={value} width="100px" />;
            })}
          </div>

          <button onClick={() => this.handleLoading()} className="button">
            {isLoading ? "Loading..." : "Generate"}
          </button>
        </section>
        {/* Results */}
        <section className="results">
          {this.state.documents.map((value, index) => {
            return (
              <div key={index} className="results__result">
                <div className="results__result__image">
                  <img src={this.state.uploads[index]} width="250px" />
                </div>
                <div className="results__result__info">
                  <div className="results__result__info__codes">
                    <small>
                      <strong>Confidence Score:</strong> {value.confidence}
                    </small>
                  </div>
                  <div className="results__result__info__codes">
                    <small>
                      <strong>Pattern Output:</strong>{" "}
                      {value.pattern &&
                        value.pattern.map(pattern => {
                          return pattern + ", ";
                        })}
                    </small>
                  </div>
                  <div className="results__result__info__text">
                    <small>
                      <strong>Full Output:</strong> {value.text}
                    </small>
                  </div>
                </div>
              </div>
            );
          })}
        </section>
      </div>
    );
  }
}

export default App;
