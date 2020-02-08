import React, { Component } from 'react';
import './Taiwanmap.css';

export default class Taiwanmap extends Component {
  constructor(props){
    super(props);
    this.state = {
      map:{},
      data: [],
      loaded: false,
      options:[],
      inputValue : "",
      makersArr: []
    }
    this.clickhandler = this.clickhandler.bind(this);
  }

componentDidMount(){
  let L = window.L;
  let map = new L.Map('taiwanmap').setView([23.79037129915711, 120.95281938174952], 8);
  let layer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
  });
  map.addLayer(layer);
  this.setState({map: map});
  
  this.loadData(); //load (/public/data.csv) to state
 }
 static getDerivedStateFromProps(nextProps, prevState) {
    let L = window.L;
    // var makersArr = [];

  let area = [];
  if(prevState.inputValue.length > 0){
      if(prevState.inputValue.length > 5){
        area = prevState.data.filter(d => {
          return d['縣市別'] ===  prevState.inputValue.substr(0,3);
        })
        area = area.filter(d =>{
          return d['鄉鎮別'] === prevState.inputValue.substr(3);
        })
      }else{
        area = prevState.data.filter(d =>{
          return d['鄉鎮別'] === prevState.inputValue;
        })
      }
      console.log('共' + area.length +'比結果');
  }
    if(prevState.loaded){
      for(let pharmacy of area){ 
        const xhr = new XMLHttpRequest();
        let url = `https://geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer/findAddressCandidates?address=${pharmacy['機構地址']}&f=json`
        xhr.open('GET', url, true);
        xhr.onload = function(){
          let point = JSON.parse(this.response)['candidates'][0]['location'];
          let marker = new L.marker(new L.latLng([point.y, point.x]));
          let popupmsg = `
          藥局名稱: ${pharmacy['醫事機構名稱']}<br/>
          地址: ${pharmacy['機構地址']}<br/>
          醫事機構代碼: ${pharmacy['醫事機構代碼']} <br/>
          電話: (${pharmacy['電話區域號碼']})-${pharmacy['電話號碼']}<br/>
          成人口罩總剩餘數: ${pharmacy['成人口罩總剩餘數']}<br/>
          兒童口罩剩餘數: ${pharmacy['兒童口罩剩餘數']}<br/>
          來源資料時間: ${pharmacy['來源資料時間']}
          `
          marker.bindPopup(popupmsg);
          prevState.map.addLayer(marker);
          prevState.makersArr.push(marker);
        }
        xhr.send();
      }
    }
    return null;
 }

  loadData(){
    const xhr = new XMLHttpRequest();
    const url = "https://raw.githubusercontent.com/moved0311/get-mask-data/master/output.csv"
    var self = this;
    xhr.open('GET', url, true);
    xhr.onreadystatechange = function(){
      if(this.readyState === 4 && this.status === 200){
        self.setState({
          data : self.csvJSON(this.response),
          loaded: true
        });
      }
    }
    xhr.send();
  }
  csvJSON(csv){
    var lines=csv.split("\n");
    var result = [];
    var headers=lines[0].split(",");
    for(var i=1;i<lines.length;i++){
        var obj = {};
        var currentline=lines[i].split(",");
        for(var j=0;j<headers.length;j++){
            obj[headers[j]] = currentline[j];
        }
        result.push(obj);
    }
    return result; 
  }
  clickhandler(event){
    //remove exist marker. 
    for(let marker of this.state.makersArr){
      this.state.map.removeLayer(marker);
    }

    console.log('查詢:' + this.inputValue.value);
    this.setState({inputValue: this.inputValue.value});
  }
  render() {
    return (
      <div>
        <div id="taiwanmap"> </div>
        <div id="query" className="leaflet-bar">
          <label>
          鄉鎮別:
          <input  placeholder="大安區" ref={(c) => this.inputValue = c}></input>
          <button onClick={this.clickhandler}>查詢</button>
          </label>
        </div>
      </div>
    )
  }
}
