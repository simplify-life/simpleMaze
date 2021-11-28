try{window.console&&window.console.log&&(console.log("欢\n迎\n查\n看\n迷宫生成器!"))}catch(e){}


var canvas = document.getElementById("canvas")
var ctx = canvas.getContext("2d")
var matrixN = 10
var w = canvas.clientWidth
var h = canvas.clientHeight
var cellW = w/matrixN,cellH = h/matrixN 

function generateMazy(matrixN=20){
    clearAll()
    generateMatrix(matrixN)
}

function generateMatrix(n){
    matrixN = n
    cellW = w/n
    cellH = h/n 
    initData()
    initUI()
    startPrim()
}

function initUI(){
    for(let i = 0 ; i <= matrixN ; i ++){
        drawLine({x:cellW*i,y:0},{x:cellW*i,y:h})
        drawLine({x:0,y:cellH*i},{x:w,y:cellH*i})
    }

    // for(let j = 0 ; j < n*n ; j ++){
    //     let x = j%n*cellW
    //     let y = Math.floor(j/n)*cellH + cellH/2
    //     drawText(j,x,y)
    // }
    connectedCell(0,0)
    connectedCell(matrixN*matrixN-1,1)
}

var map = []

function initData(){
    map = []
    for(let j = 0 ; j < matrixN*matrixN ; j ++){
        map.push({
            idx:j,
            neighbor:[null,null,null,null],
            G:null,
            H:null,
            father:null,
            inOpen:false,
            inClose:false
        })
    }
}


function drawLine(start,end){
    ctx.beginPath()
    ctx.moveTo(start.x,start.y)
    ctx.lineTo(end.x,end.y)
    ctx.strokeStyle="rgb(0,160,0)"
    ctx.stroke()
}

function drawText(text,x,y){
    ctx.font="10px Arial"
    ctx.fillText(text,x+cellW/2-5,y+5)
}

function clearAll(){
    ctx.clearRect(0,0, canvas.clientWidth, canvas.clientHeight)
}

/**
 * 连通 
 * @param {*} index 格子方向
 * @param {*} direct 0上1下2左3右
 */
function connectedCell(index,direct){
    let x = (index%matrixN)*cellW
    let y = Math.floor(index/matrixN)*cellH
    let cw = cellW-2
    let ch = cellH-2
    switch (direct) {
        case 0:
            ctx.clearRect(x+1,y-2,cw,4)
            break;
        case 1:
            ctx.clearRect(x+1,y-2+cellH,cw,4)
            break;
        case 2:
            ctx.clearRect(x-2,y+1,4,ch)
            break;
        case 3:
            ctx.clearRect(x-2+cellW,y+1,4,ch)
            break;
        default:
            break;
    }
}

var cellAll = []
var wallAll = []

/**
 * 生成迷宫
 */
function startPrim(){
    cellAll = new Array(matrixN*matrixN).fill(0).map((_,i)=>[i])
    for(let x = 0 ; x < matrixN ; x ++){
        for(let y = 0 ; y < matrixN ; y ++){
            //第 x,y 坐标的格子
            let idx = y*matrixN + x
            let btm = getDirectIndex(idx,1)
            let right = getDirectIndex(idx,3)
            if(btm!=-1){
                wallAll.push([idx,btm,1])
            }
            if(right!=-1){
                wallAll.push([idx,right,3])
            }
        }
    }
    let idx = 0
    let int = setInterval(()=>{
        if(isNotEnd()){
            idx = connectedCellRandom()
        }else{
            clearInterval(int)
            console.log("------------------",cellAll[idx].length)
            console.log(map)
        }
    },10)
    
    // while(isNotEnd()){
    //     idx = connectedCellRandom()
    // }
    // console.log("------------------",cellAll[idx].length)
}

function getDirectIndex(index,direct){
    let min = 0
    let maxXY = matrixN - 1
    let x = index%matrixN
    let y = Math.floor(index/matrixN)
    switch (direct) {
        case 0:
           //上
            if(y-1>=min && y-1<=maxXY ){
                return (y-1)*matrixN+x
            }
            return -1;
        case 1:
            //下
            if(y+1>=min && y+1<=maxXY){
                return (y+1)*matrixN+x
            }
            return -1;
        case 2:
            //左
            if(x-1>=min && x-1<=maxXY ){
                return y*matrixN+x-1
            }
            return -1;
        case 3:
            //右
            if(x+1>=min && x+1<=maxXY ){
                return y*matrixN+x+1
            }
            return -1
        default:
            break;
    }
    return -1
}
                                                                   
function connectedCellRandom(){
    let wallIdx = Math.floor(Math.random()*wallAll.length)
    let wall = wallAll[wallIdx]
    let from = wall[0]
    let to = wall[1]
    let direct = wall[2]
    let tmp = cellAll[from].concat(cellAll[to])
    //去重
    cellAll[from] = Array.from(new Set(tmp))

    let len = wallAll.length
    while(len--){
        if(cellAll[from].indexOf(wallAll[len][0])!=-1&&cellAll[from].indexOf(wallAll[len][1])!=-1){
            wallAll.splice(len,1)
        }
    }
    //所有集合归并
    for(let i = 0 ; i < cellAll[from].length ; i++){
        let idx = cellAll[from][i]
        cellAll[idx] = cellAll[from]
    }
    connectedCell(from,direct)

    // console.log("connect", from , to )
    // console.log(cellAll)
    map[from].neighbor[direct]=to
    map[to].neighbor[direct-1]=from
    return from
}

function isNotEnd(){
    for(let i = 0 ; i < cellAll.length ; i ++){
        let cell = cellAll[i]
        if(cell.indexOf(0)!=-1 && cell.indexOf(matrixN*matrixN-1)!=-1 ){
            return false
        } 
    }
    return true
}

function idxToXY(idx){
    let x = idx%matrixN
    let y = Math.floor(idx/matrixN)
    return {x:x,y:y}
}

function getDis(from,to){
    let fromXY = idxToXY(from)
    let toXY = idxToXY(to)
    return Math.abs(fromXY.x - toXY.x) + Math.abs(fromXY.y - toXY.y) 
}


function drawTag(idx){
    let j = idx
    let n = matrixN
    let x = j%n*cellW+cellW/2
    let y = Math.floor(j/n)*cellH+cellH/2
    ctx.beginPath()
    ctx.arc(x,y,cellW/4,0,360)
    ctx.fillStyle="green"
    ctx.fill()
    ctx.closePath()
}

/**
 * A*寻路
 */
function startSearch(){
    let openList = []
    let closeList = []
    let startNode = map[0]
    let endNode = map[matrixN*matrixN-1]
    startNode.G = 0
    startNode.H = getDis(startNode.idx,endNode.idx)
    let addOpen = (node)=>{        
        for(let i = 0 ; i < node.neighbor.length ; i ++){
            let ii = node.neighbor[i]
            if(ii!=null){
                let nodeI = map[ii]
                if(nodeI.inClose) continue
                let g = node.G + getDis(node.idx,nodeI.idx)
                if(nodeI.inOpen){
                    if(nodeI.G>g){
                        nodeI.father = node
                        nodeI.G = g
                    }
                }else{
                    nodeI.inOpen = true
                    nodeI.father = node
                    nodeI.G = g
                    nodeI.H = getDis(nodeI.idx,endNode.idx)
                    openList.push(nodeI)
                    // drawTag(nodeI.idx)
                }
            }
        }
        openList.sort((a,b)=>(a.G+a.H)-(b.G+b.H))
        closeList.push(node)
        node.inClose = true
    }

    addOpen(startNode)
    
    let popMinNode = ()=>{
        return openList.shift()
    }
    
    let minNode = popMinNode()
    let p = 0
    while(minNode&&minNode.idx!=endNode.idx){
        minNode.inOpen = false
        addOpen(minNode)
        let j = minNode.idx
        let n = matrixN
        let x = j%n*cellW
        let y = Math.floor(j/n)*cellH + cellH/2
        // drawText(p++,x,y)
        minNode = popMinNode()
    }

    if(minNode){
        console.log("路径已经找到",minNode)
        drawPath(minNode)
    }else{
        console.log("没有可达路径",map)
    }
}

function drawPath(node){
    let from = node.idx
    while(map[from].father!=null){
        let to = map[from].father.idx
        console.log("from",from,"to",to)
        let start = {
            x:from%matrixN*cellW+cellW/2,
            y:Math.floor(from/matrixN)*cellH+cellH/2
        }
        let end = {
            x:to%matrixN*cellW+cellW/2,
            y:Math.floor(to/matrixN)*cellH+cellH/2
        }
        ctx.beginPath()
        ctx.moveTo(start.x,start.y)
        ctx.lineTo(end.x,end.y)
        ctx.strokeStyle="rgb(0,0,160)"
        ctx.stroke()
        from = to
    }
}
