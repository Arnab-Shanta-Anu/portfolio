import React from 'react';
import { connect } from 'react-redux';
import ReactCrop from 'react-image-crop';
import { getProfileImage } from '../actions';

import '../static/css/profileImage.css'
import 'react-image-crop/dist/ReactCrop.css';

class ProfileImage extends React.Component {

  state = {
    src: null,
    crop: {
      unit: '%',
      width: 225,
      height: 300,
    },
  };
 
  componentDidMount (){
    console.log(this.props);
  }

  uploadImage = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const reader = new FileReader();
      reader.addEventListener('load', () =>
        this.setState({ src: reader.result })
      );
      reader.readAsDataURL(e.target.files[0]);
    }
  }

  onImageLoaded = image => {
    this.imageRef = image;
  };

  onCropComplete = crop => {
    this.makeClientCrop(crop);
  };

  onCropChange = (crop, percentCrop) => {
    this.setState({ crop });
  };

  async makeClientCrop(crop) {
    if (this.imageRef && crop.width && crop.height) {
      const croppedImageUrl = await this.getCroppedImg(
        this.imageRef,
        crop,
        'newFile.jpeg'
      );
      this.setState({ croppedImageUrl });
    }
  }

  getCroppedImg(image, crop, fileName) {
    const canvas = document.createElement('canvas');
    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;
    canvas.width = crop.width;
    canvas.height = crop.height;
    const ctx = canvas.getContext('2d');

    ctx.drawImage(
      image,
      crop.x * scaleX,
      crop.y * scaleY,
      crop.width * scaleX,
      crop.height * scaleY,
      0,
      0,
      crop.width,
      crop.height
    );

    return new Promise((resolve, reject) => {
      canvas.toBlob(blob => {
        if (!blob) {
          console.error('Canvas is empty');
          return;
        }
        blob.name = fileName;
        window.URL.revokeObjectURL(this.fileUrl);
        this.fileUrl = window.URL.createObjectURL(blob);
        resolve(this.fileUrl);
      }, 'image/jpeg');
    });
  }

  saveImage = () => {
    this.props.getProfileImage(this.state.croppedImageUrl);
    this.props.toggleModal();
  }

  render() {
    const { crop, croppedImageUrl, src } = this.state;
    return (
      <div className="card">
        <div className="image-cropper">
          {src && (
            <ReactCrop
              src={src}
              crop={crop}
              ruleOfThirds
              onImageLoaded={this.onImageLoaded}
              onComplete={this.onCropComplete}
              onChange={this.onCropChange}
            />
          )}
        </div>
        <div className={"uploader"}>
          <div>
            <p>Upload an profile image</p>
            <input type="file" onChange={this.uploadImage}/>
          </div>
        </div>
        <div>
          {croppedImageUrl && (
            <img alt="Crop" style={{ maxWidth: '100%' }} src={croppedImageUrl} />
          )}
        </div>
        <button onClick={this.saveImage}>submit</button>
      </div>
    );
  }
}

export default connect(null, {getProfileImage})(ProfileImage);