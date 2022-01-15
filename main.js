let carnivalHeight = 10, carnivalWidth = 8;
let start = [0, 0];
let end = [5, 5];
let stops = [
    [2, 4],
    [6, 0]
]

let carnival = [
    [0, 1, 0, 0, 0, 1], 
    [0, 1, 0, 0, 0, 1], 
    [0, 1, 0, 1, 0, 1], 
    [0, 1, 0, 1, 0, 1], 
    [0, 0, 0, 1, 1, 1],
    [0, 1, 0, 0, 0, 0], 
    [0, 1, 0, 0, 0, 1]
];

function route(start, end, map) {
    let shortest = [];
    shortest[map.length * map[0].length] = true;       //Set the default path to largest possible size
    const dfs = (i,j, count, path = [])=>{
        if(i==end[0] && j==end[1]){
            if(shortest.length > path.length) shortest = path;
            return;
        }

        if(i<0 || i>map.length - 1) return;

        else if(j<0 || j>map[0].length - 1) return;

        else if(map[i][j]==1) return;

        const current = map[i][j];
        map[i][j] = 1;

        path.push([i, j]);

        dfs(i + 1, j, count + 1, [...path]);
        dfs(i - 1, j, count + 1, [...path]);
        dfs(i, j + 1, count + 1, [...path]);
        dfs(i, j - 1, count + 1, [...path]);

        map[i][j] = current;
    }
    dfs(start[0], start[1], 0);
    return(shortest);
}

//console.log(route([0,0], [0,2], carnival));
const getPermutations = arr => {

    const output = [];
  
    const swapInPlace = (arrToSwap, indexA, indexB) => {
      const temp = arrToSwap[indexA];
      arrToSwap[indexA] = arrToSwap[indexB];
      arrToSwap[indexB] = temp;
    };
  
    const generate = (n, heapArr) => {
      if (n === 1) {
        output.push(heapArr.slice());
        return;
      }
  
      generate(n - 1, heapArr);

      for (let i = 0; i < n - 1; i++) {
        if (n % 2 === 0) {
          swapInPlace(heapArr, i, n - 1);
        } else {
          swapInPlace(heapArr, 0, n - 1);
        }
  
        generate(n - 1, heapArr);
      }
    };
  
    generate(arr.length, arr.slice());

    return output;
};

function finalPath(start, stops, end, map){
    let allPaths = getPermutations(stops);
    let fullPaths = [];
    for(let i = 0; i<allPaths.length; i++){
        let path = [start].concat(allPaths[i]).concat([end]);
        let fullPath = [];
        for(let j = 1; j< path.length; j++){
            fullPath = fullPath.concat(route(path[j-1], path[j], map));
        }
        fullPaths.push(fullPath);
    }

    let shortestFullPath = [];
    shortestFullPath[map.length * map[0].length] = true;
    for(let i = 0; i < fullPaths.length; i++) {
        if(shortestFullPath == undefined || fullPaths[i].length < shortestFullPath.length) shortestFullPath = fullPaths[i];
    }
    return shortestFullPath.concat([end]);
}




console.log(finalPath(start, stops, end, carnival));


