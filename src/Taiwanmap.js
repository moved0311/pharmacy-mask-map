import React, { Component } from 'react';
import './Taiwanmap.css';
import $ from 'jquery';

export default class Taiwanmap extends Component {
  constructor(props){
    super(props);
    this.state = {
      map:{},
      data: [],
      loaded: false,
      options:[],
      inputValue : ""
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
    var makersArr = [];
    let area = prevState.data.filter(function(item, index, array){
      if(prevState.inputValue.lenght !== 0) 
        return item['鄉鎮別'] === prevState.inputValue;
    });

    if(prevState.loaded){
      for(let pharmacy of area){ //area.length
          // console.log('2.', prevState.data[i]['機構地址']);
          L.esri.Geocoding.geocode().address(pharmacy['機構地址']).run(function (err, results, response) {
            if (err) {
              // console.log(err);
              return;
            }
            // console.log(results.results[0].latlng);  //first address result latlng 
            let latlng = results.results[0].latlng;
            let marker = new L.marker(latlng);
            let popupmsg = `
            藥局名稱: ${pharmacy['醫事機構名稱']}<br/>
            地址: ${pharmacy['機構地址']}<br/>
            醫事機構代碼: ${pharmacy['醫事機構代碼']} <br/>
            電話: (${pharmacy['電話區域號碼']})-${pharmacy['電話號碼']}`
            marker.bindPopup(popupmsg);
            prevState.map.addLayer(marker);
            makersArr.push(marker);
          });
      }
    }

    return null;
 }

  loadData(){
    const xhr = new XMLHttpRequest();
    const url = "/1090205data.csv";
    var self = this;
    xhr.open('GET', url, true);
    xhr.onload = function(){
      self.setState({
        data : self.csvJSON(this.response),
        loaded: true
      });
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
    $(".leaflet-marker-icon").remove(); 
    $(".leaflet-popup").remove();
    $(".leaflet-shadow-pane img").remove();

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
