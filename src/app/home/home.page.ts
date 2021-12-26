import { Component, OnInit } from '@angular/core';
import { Directory } from '@capacitor/filesystem/dist/esm/definitions';
import { Filesystem } from '@capacitor/filesystem/dist/esm';
import { VoiceRecorder } from 'capacitor-voice-recorder/dist/esm';
import {
  RecordingData,
  CurrentRecordingStatus,
  GenericResponse,
} from 'capacitor-voice-recorder/dist/esm/definitions';
import {
  FileTransfer,
  FileTransferObject,
  FileUploadOptions,
} from '@ionic-native/file-transfer/ngx';
import { Media, MediaObject } from '@ionic-native/media/ngx';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage implements OnInit {
  recording = false;
  storedFileNames = [];
  recordingStatus = 0;
  private uploadURL = 'http://192.168.1.7:85/mdictationsync/api/mupload.php';

  constructor(private fileTransfer: FileTransfer, private media: Media) {}

  ngOnInit() {
    this.loadFiles();

    VoiceRecorder.requestAudioRecordingPermission();
  }

  async loadFiles() {
    Filesystem.readdir({
      path: '',
      directory: Directory.Data,
    }).then((result) => {
      console.log(result);
      this.storedFileNames = result.files;
    });
  }

  startRecording() {
    if (this.recording) {
      return;
    }
    this.recording = true;
    VoiceRecorder.startRecording();
    VoiceRecorder.getCurrentStatus().then((result: CurrentRecordingStatus) => {
      console.log('startRecordingStatus ====> ', result.status);
    });
  }

  pauseRecording() {
    if (!this.recording) {
      return;
    }
    VoiceRecorder.pauseRecording();
    VoiceRecorder.getCurrentStatus().then((result: CurrentRecordingStatus) => {
      console.log('pauseRecordingStatus ====> ', result.status);
    });
  }

  resumeRecording() {
    if (!this.recording) {
      return;
    }
    VoiceRecorder.resumeRecording()
      .then((result: GenericResponse) =>
        console.log('resumeRecordingResult ====> ', result.value)
      )
      .catch((error) => console.log('resumeRecordingError ====> ', error));
    VoiceRecorder.getCurrentStatus().then((result: CurrentRecordingStatus) => {
      console.log('resumeRecordingStatus ====> ', result.status);
    });
  }

  async stopRecording() {
    if (!this.recording) {
      return;
    }
    VoiceRecorder.stopRecording().then(async (result: RecordingData) => {
      if (result.value && result.value.recordDataBase64) {
        const recordData = result.value.recordDataBase64;
        console.log('RecordData ===> ', recordData);
        const fileName = 'Recording.m4a';
        await Filesystem.writeFile({
          path: fileName,
          directory: Directory.Data,
          data: recordData,
        });
        this.loadFiles();
        this.upload(fileName, Directory.Data);
      }
    });
    VoiceRecorder.getCurrentStatus().then((result: CurrentRecordingStatus) => {
      console.log('stopRecordingStatus ====> ', result.status);
    });
  }

  async playFile(fileName) {
    const audioFile = await Filesystem.readFile({
      path: fileName,
      directory: Directory.Data,
    });
    console.log('AudioFile ====>', audioFile);

    const getDir = await Filesystem.getUri({
      path: fileName,
      directory: Directory.Data,
    });
    console.log('getDir ====>', getDir.uri);

    const file: MediaObject = this.media.create(
      getDir.uri.replace(/^file:\/\//g, '')
    );

    file.onStatusUpdate.subscribe((status) => {
      console.log('onStatusUpdate ====> ', status);
    });

    file.onError.subscribe((error) => {
      console.log('onError ====> ', error);
    });

    file.play();
    file.setVolume(1.0);

    // const base64Sound = audioFile.data;

    // const audioRef = new Audio(`data:audio/aac;base64,${base64Sound}`);
    // audioRef.oncanplaythrough = () => audioRef.play();
    // audioRef.load();
  }

  upload(sFileKey, sLocalFilePath) {
    console.log('sFileKey ===> |' + sFileKey + '|');
    const fileTransferObject: FileTransferObject = this.fileTransfer.create();
    const options: FileUploadOptions = {
      fileKey: 'filename',
      fileName: sFileKey,
      httpMethod: 'post',
      chunkedMode: false,
      mimeType: 'audio/aac',
    };

    fileTransferObject
      .upload(
        '/data/user/0/io.ionic.starter/files/' + sFileKey,
        this.uploadURL,
        options
      )
      .then(async (data) => {
        const response = JSON.parse(data.response);
        console.log(response);
      })
      .catch((err) => {
        console.log(err);
      });
  }
}

// file:///data/user/0/io.ionic.starter/files/Rec.m4a
