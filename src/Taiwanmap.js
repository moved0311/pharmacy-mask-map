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
  // console.log(prevState.data['features']);
  let area = [];
  let testSample = [];
  let allPharmacy = prevState.data['features'];
  
  if(prevState.inputValue.length > 0){
      // let testSample = allPharmacy.slice(0,10);
    //  console.log(testSample);
      if(prevState.inputValue.length > 5){
           area = allPharmacy.filter(addr =>{
            return addr['properties']['address'].substr(0,6) === prevState.inputValue;
          })
      }else{
          area = allPharmacy.filter(addr =>{
            return addr['properties']['address'].substr(3,3) === prevState.inputValue;
          })
      }
      console.log('共' + area.length +'比結果');
  }
    if(prevState.loaded){
      // let testSample = allPharmacy.slice(0,10);
      for(let pharmacy of area){ 
        let coordiantes = pharmacy['geometry']['coordinates'];
        coordiantes = [coordiantes[1], coordiantes[0]];
        let marker = new L.marker(new L.latLng(coordiantes));
        let popupmsg = `
        藥局名稱: ${pharmacy['properties']['name']}<br/>
        地址: ${pharmacy['properties']['address']}<br/>
        醫事機構代碼: ${pharmacy['properties']['id']} <br/>
        電話: ${pharmacy['properties']['phone']}<br/>
        成人口罩總剩餘數: ${pharmacy['properties']['mask_adult']}<br/>
        兒童口罩剩餘數: ${pharmacy['properties']['mask_child']}<br/>
        來源資料時間: ${pharmacy['properties']['updated']}
        `
        marker.bindPopup(popupmsg);
        prevState.map.addLayer(marker);
        prevState.makersArr.push(marker);
      }
    }
    return null;
 }

  loadData(){
    const xhr = new XMLHttpRequest();
    // const url = "https://raw.githubusercontent.com/moved0311/get-mask-data/master/output.csv"
    const url ="https://raw.githubusercontent.com/kiang/pharmacies/master/json/points.json?fbclid=IwAR3fyzFIBPOMj1WcDLJaXEYFZQiAlfW9BFYpsSN_sELepbKtdjM4HGgP7NM"
    var self = this;
    xhr.open('GET', url, true);
    xhr.onreadystatechange = function(){
      if(this.readyState === 4 && this.status === 200){
        self.setState({
          data : JSON.parse(this.response),
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
          <input  placeholder="台北市大安區 or 大安區" ref={(c) => this.inputValue = c}></input>
          <button onClick={this.clickhandler}>查詢</button>
          </label>
        </div>
      </div>
    )
  }
}
