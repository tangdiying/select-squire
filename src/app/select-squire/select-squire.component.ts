import { Component, OnInit, Input, ViewChild, OnDestroy, Output, EventEmitter, AfterViewInit } from '@angular/core';
import { fromEvent, interval } from 'rxjs';

@Component({
  selector: 'app-select-squire',
  templateUrl: './select-squire.component.html',
  styleUrls: ['./select-squire.component.css']
})
export class SelectSquireComponent implements OnInit,OnDestroy,AfterViewInit {
  
  domOffsetX = null;
  domOffsetY = null;
  lineStyle = {};
  lineCopy = {};
  oldPosition = {};
  nowPosition = {};
  isMove:boolean = false;
  clickScroll = {};
  mouseMove=null;
  mouseUp=null;
  scrollMove = {};
  scrollupdownIntervel = null;
  scrollleftrightInterval = null;
  @Input() handleClass:string;
  @Input() scrollClass:string;
  @Input() allData
  @Output() selectedData = new EventEmitter<any>();
  @ViewChild("container",{static:true}) container;
  @ViewChild("box",{static:true}) box;
  constructor() { }

  ngOnInit() {
    // this.getAllOffset()
    this.bind()
    
  }
  ngOnDestroy(){
    this.mouseMove.unsubscribe();
    this.mouseUp.unsubscribe();
  }
  ngAfterViewInit(): void {
  }
  clickDown(e){
    this.getAllOffset();
    this.oldPosition = {
      x:e['pageX'],
      y:e['pageY']
    }
    if(!this.isMove){
      this.isMove = true;
      this.lineStyle = {
        top:"0px"
      }
    }
    let dom=this.checkScrollDom()['dom'];
    this.clickScroll = {
      top:dom.scrollTop,
      left:dom.scrollLeft,
      height:dom.scrollHeight,
      width:dom.scrollWidth
    }
    this.clearChild()
    this.pauseEvent(e)
  }
  bind(){
    this.mouseMove = fromEvent(document,"mousemove")
    .subscribe(e=>{
      this.clickMove(e)
    })
    this.mouseUp = fromEvent(document,"mouseup")
    .subscribe(e=>{
      this.clickUp(e)
    })
  }
  clickMove(e){
    if(this.isMove){
      if(e['pageY']>this.nowPosition['y']){
        this.scrollMove['uptodown'] = true
      }else{
        this.scrollMove['uptodown'] = false
      }
      if(e['pageX']>this.nowPosition['x']){
        this.scrollMove['lefttoright'] = true
      }else{
        this.scrollMove['lefttoright'] = false
      }
      this.nowPosition = {
        x:e['pageX'],
        y:e['pageY']
      }

      this.createFrame(this.oldPosition,this.nowPosition)
    }
  }
  createFrame(old,now){
    let dom = this.checkScrollDom()['dom'];
    let type = this.checkScrollDom()['type']
    if(type){
      this.handleOtherMove(old,now,dom)
    }else{
      this.handleBodyMove(old,now,dom)
    }
  }
  handleOtherMove(old,now,dom){
    let scrollTop = dom.scrollTop;
    let scrollLeft = dom.scrollLeft;
    if(this.scrollupdownIntervel){
      clearInterval(this.scrollupdownIntervel)
    }
    if(this.scrollleftrightInterval){
      clearInterval(this.scrollleftrightInterval)
    }
    if(now['y']>this.domOffsetY+dom.clientHeight){
      now['y'] = this.domOffsetY+dom.clientHeight
      this.scrollMove['uptodown'] = true;
    }
    if(now['x']>this.domOffsetX+dom.clientWidth){
      now['x'] = this.domOffsetX+dom.clientWidth
      this.scrollMove['lefttodown'] = true;
    }
    let width;
    let height;
    let left;
    let top;
    width = Math.abs(now['x']-old['x'])+Math.abs(scrollLeft-this.clickScroll['left'])
    height = Math.abs(now['y']-old['y'])+Math.abs(scrollTop-this.clickScroll['top'])
    if(now['x']>old['x']){
      left = old['x']-this.domOffsetX+this.clickScroll['left'];
    }else{
      left = now['x']-this.domOffsetX+scrollLeft;
    }
    if(now['y']>old['y']){
      top = old['y']-this.domOffsetY+this.clickScroll['top'];
    }else{
      top = now['y'] - this.domOffsetY+scrollTop;
    }
    if(now['y'] >= this.domOffsetY+dom.clientHeight&&height+top<this.clickScroll['height']){
      this.scrollupdownIntervel = setInterval(()=>{
        dom.scrollTo(dom.scrollLeft,dom.scrollTop+5);
        scrollTop = dom.scrollTop;
        height = Math.abs(now['y']-old['y'])+Math.abs(scrollTop-this.clickScroll['top'])
        this.createLine(width,height,left,top,dom)
        if(height+top+20>this.clickScroll['height']){
          clearInterval(this.scrollupdownIntervel)
        }
      },10)
    }
    if(now['y']<=this.domOffsetY+20){
      this.scrollupdownIntervel = setInterval(()=>{
        dom.scrollTo(dom.scrollLeft,dom.scrollTop-5);
        scrollTop = dom.scrollTop;
        height = Math.abs(now['y']-old['y'])+Math.abs(scrollTop-this.clickScroll['top'])
        top = now['y'] - this.domOffsetY+scrollTop;
        this.createLine(width,height,left,top,dom)
        if(scrollTop==0){
          clearInterval(this.scrollupdownIntervel)
        }
      },10)
    }
    if(now['x'] >= this.domOffsetX+dom.clientWidth&&left+width<this.clickScroll['width']){
      this.scrollleftrightInterval = setInterval(()=>{
        dom.scrollTo(dom.scrollLeft+5,dom.scrollTop);
        scrollLeft = dom.scrollLeft;
        width = Math.abs(now['x']-old['x'])+Math.abs(scrollLeft-this.clickScroll['left'])
        this.createLine(width,height,left,top,dom)
        if(left+width+20>this.clickScroll['width']){
          clearInterval(this.scrollleftrightInterval)
        }
      },10)
    }
    if(now['x']<this.domOffsetX+20){
      this.scrollleftrightInterval = setInterval(()=>{
        dom.scrollTo(dom.scrollLeft-5,dom.scrollTop);
        scrollLeft = dom.scrollLeft;
        width = Math.abs(now['x']-old['x'])+Math.abs(scrollLeft-this.clickScroll['left'])
        left = now['x']-this.domOffsetX+scrollLeft;
        this.createLine(width,height,left,top,dom)
        if(scrollLeft==0){
          clearInterval(this.scrollleftrightInterval)
        }
      },10)
    }
    if(now['x']<this.domOffsetX&&!this.scrollMove['lefttoright']){
      dom.scrollTo(dom.scrollLeft-5,dom.scrollTop);
    }
    // console.log(dom.clientHeight)
    this.createLine(width,height,left,top,dom)
  }
  handleBodyMove(old,now,dom){
    let scrollTop = dom.scrollTop;
    let scrollLeft = dom.scrollLeft;
    if(now['y']>dom.scrollHeight){
      now['y'] = dom.scrollHeight
    }
    if(now['x']>dom.scrollWidth){
      now['x'] = dom.scrollWidth
    }
    let width;
    let height;
    let left;
    let top;
    width = Math.abs(now['x']-old['x'])
    height = Math.abs(now['y']-old['y'])
    if(now['x']>old['x']){
      left = old['x']-this.domOffsetX;
    }else{
      left = now['x']-this.domOffsetX;
    }
    if(now['y']>old['y']){
      top = old['y']-this.domOffsetY;
    }else{
      top = now['y']-this.domOffsetY;
    }
    if(height+top+50+this.domOffsetY>dom.clientHeight+dom.scrollTop&&height+top+this.domOffsetY<this.clickScroll['height']+2&&this.scrollMove['uptodown']){
      dom.scrollTo(dom.scrollLeft,dom.scrollTop+5)
    }
    if(now['y']-50<dom.scrollTop&&!this.scrollMove['uptodown']){
      dom.scrollTo(dom.scrollLeft,dom.scrollTop-5)
    }
    if(left+width+50+this.domOffsetX>dom.clientWidth+dom.scrollLeft&&left+width+this.domOffsetX<this.clickScroll['width']+2&&this.scrollMove['lefttoright']){
      dom.scrollTo(dom.scrollLeft+5,dom.scrollTop)
    }
    if(now['x']-50<dom.scrollLeft&&!this.scrollMove['lefttoright']){
      dom.scrollTo(dom.scrollLeft-5,dom.scrollTop)
    }
    
    this.createLine(width,height,left,top,dom)
  }
  createLine(width,height,left,top,dom){//画线框
    this.lineStyle = {
      width:width+"px",
      height:height+"px",
      left:left+"px",
      top:top+"px"
    }
    this.lineCopy = {
      width:width,
      height:height,
      left:left,
      top:top
    }
  }
  clickUp(e){
    this.selectChild()
    this.isMove = false;
    this.reset()
    if(this.scrollupdownIntervel){
      clearInterval(this.scrollupdownIntervel)
    }
    if(this.scrollleftrightInterval){
      clearInterval(this.scrollleftrightInterval)
    }
  }
  getAllOffset(){//获取偏移量
    let dom = this.container.nativeElement
    let t = dom.offsetTop;
    let l = dom.offsetLeft;
    while(dom = dom.offsetParent){
      t+=dom.offsetTop;
      l+=dom.offsetLeft;
    }
    this.domOffsetX = t;
    this.domOffsetY = l;
  }
  pauseEvent(e){
    if(e.stopPropagation) e.stopPropagation();
    if(e.preventDefault) e.preventDefault();
    e.cancelBubble=true;
    e.returnValue=false;
    return false;
  }
  reset(){
    this.lineStyle = {};
    this.lineCopy = {};
    this.oldPosition = {
      x:0,
      y:0
    }
    this.nowPosition = {
      x:0,
      y:0
    }
  }
  selectChild(){//选中被框选的元素
    let children=this.checkFather(this.handleClass);
    let data = []
    for(let i = 0;i<children.length;i++){
      if(children[i]['offsetLeft']+children[i]['clientWidth']>this.lineCopy['left']
      &&children[i]['offsetTop']+children[i]['clientHeight']>this.lineCopy['top']
      &&children[i]['offsetLeft']<(this.lineCopy['left']+this.lineCopy['width'])
      &&children[i]['offsetTop']<(this.lineCopy['top']+this.lineCopy['height'])){
        children[i].classList.add('select')
        data.push(this.allData[i])
      }
    }
    this.selectedData.emit(data)
  }
  checkFather(handleClass){//对框选的子集包裹元素做出判断
    let children;
    if(handleClass){
      children = document.getElementsByClassName(this.handleClass)[0].children;
    }else{
      children = this.box.nativeElement.children;
    }
    return children
  }
  clearChild(){//清除选中元素
    let children=this.checkFather(this.handleClass);
    
    for(let i = 0;i<children.length;i++){
      children[i].classList.remove('select')
    }
    
  }
  isScrollBar(dom){//判断是否有滚动条
    if(dom['scrollHeight']>dom['clientHeight']){
      return true
    }else if(dom['scrollWidth']>dom['clientWidth']){
      return true
    }else{
      return false
    }
  }
  checkScrollDom(){//检测我们需要的滚动条
    let dom,type;
    if(this.scrollClass&&this.isScrollBar(document.getElementsByClassName(this.scrollClass)[0])){
      dom = document.getElementsByClassName(this.scrollClass)[0];
      type = 1;
    }else if(this.isScrollBar(this.container.nativeElement)){
      dom = this.container.nativeElement;
      type = 2;
    }else{
      dom = document.documentElement;
      type = 0
    }
    return {
      dom:dom,
      type:type
    }
  }
}
