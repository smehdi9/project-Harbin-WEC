/* INPUTS */
let height = 8, width = 6;
let start = [0, 0];
let end = [5, 5];
let stops = [
    [2, 4],
    [5, 0]
];

// Carnival map
let carnival = generateMap(height, width, start, stops, end, 0.2);
//Sample map:
// [
//     [0, 1, 0, 0, 0, 1], 
//     [0, 1, 0, 0, 0, 1], 
//     [0, 1, 0, 1, 0, 1], 
//     [0, 1, 0, 1, 0, 1], 
//     [0, 0, 0, 1, 1, 1],
//     [0, 1, 0, 0, 0, 0], 
//     [0, 1, 0, 0, 0, 1]
// ];

console.log("Raw map:");
printmap(carnival);  //Display the carnival
let path = finalPath(start, stops, end, carnival);

if(path[0] === undefined) {
    console.log("NO PATH EXISTS!");
}
else {
    console.log("Abstract path:");
    console.log(path);
    console.log("Visualized path:");
    printmap(carnival, path);  //Display the carnival
}


//Generate map (Add obstacles only where there isn't a stop)
function generateMap(h, w, start, stops, end, obstacleRate) {
    let map = new Array(h).fill(0).map(() => new Array(w).fill(0));

    //Populate map with obstacles
    for(let i = 0; i < h; i++) {
        for(let j = 0; j < w; j++) {
            //Ensure the point does not collide with path stops
            if(i == start[0] && j == start[1]) continue;
            if(i == end[0] && j == end[1]) continue;
            let collision = false;
            //Check for each stop in the list
            for(let n = 0; n < stops.length; n++) {
                if(i == stops[n][0] && j == stops[n][1]) {
                    collision = true;
                    break;
                }
            }
            if(collision) continue;
            
            //Generate a random number and see if it is below the generation rate
            let rng = Math.random();
            if(rng < obstacleRate) map[i][j] = 1;
        }
    }

    return map;
}



//Print the full map onto console (With the path, if passed)
function printmap(map, path = []) {
    for(let i = 0; i < map.length; i++) {
        let row = "[   ";
        for(let j = 0; j < map[i].length; j++) {
            //Color the points that are in the path
            let inPath = false;
            for(let n = 0; n < path.length; n++) {
                if(path[n][0] == i && path[n][1] == j) {
                    inPath = true;
                    break;
                }
            }
            if(inPath) row += "\x1b[32m";
            row += map[i][j] + "\x1b[0m    ";
        }
        row += "]";
        console.log(row);
    }
    console.log();
}



//Find the shortest route between two points on the map (Only two points), that avoids all of the obstacles
function route(start, end, map) {
    let shortest = [];
    shortest[map.length * map[0].length] = true;       //Set the default path to largest possible size

    //Use Depth First Search to find the paths that lead to the target point
    const dfs = (i,j, path = [])=>{
        //If the target point is reached through a particular path, check if this path is the shortest one to the point. If it is, replace the current known path
        if(i==end[0] && j==end[1]){
            if(shortest.length > path.length) shortest = path;
            return;
        }

        //If the current point is out of bounds or within an obstacle, reject it
        if(i<0 || i>map.length - 1) return;
        else if(j<0 || j>map[0].length - 1) return;
        else if(map[i][j]==1) return;

        //To avoid checking points that we've already visited
        const current = map[i][j];
        map[i][j] = 1;

        //If the point is valid, add it on to the path
        path.push([i, j]);

        //Check all paths above, below, left and right
        dfs(i + 1, j, [...path]);
        dfs(i - 1, j, [...path]);
        dfs(i, j + 1, [...path]);
        dfs(i, j - 1, [...path]);

        map[i][j] = current;
    }

    //Perform DFS and return the shortest path between points
    dfs(start[0], start[1]);
    return(shortest);
}



//Get all permutations of any list, this will provide us with all possible permutations for our candidate paths from start to end, Using heap's algorithm: https://en.wikipedia.org/wiki/Heap%27s_algorithm
function getPermutations(list) {
    const permutations = [];
    //Helper function to swap members of the list
    const swap = (listToSwap, i, j) => {
        const temp = listToSwap[i];
        listToSwap[i] = listToSwap[j];
        listToSwap[j] = temp;
    };

    //Generate the permutations
    const generate = (n, heap) => {
        //If n = 1, output the new permutation
        if (n == 1) {
            permutations.push(heap.slice());
            return;
        }

        generate(n - 1, heap);
        for(let i = 0; i < n - 1; i++) {
            //If n == 0, swap at index i
            if (n % 2 === 0) swap(heap, i, n - 1); 
            //Else swap at index 0
            else swap(heap, 0, n - 1);
            generate(n - 1, heap);
        }
    };
    generate(list.length, list.slice());
    return permutations;
};



//Generate the shortest final path from start to end that goes through each point
function finalPath(start, stops, end, map){
    let allPaths = getPermutations(stops);      //Generate all the candidate permutations that give us the order of the stops between start and end
    let fullPaths = [];                         //This will store all the FULL paths, that include each individual point on the matrix between the start and end
    //Generate all of the full paths
    for(let i = 0; i<allPaths.length; i++){
        let path = [start].concat(allPaths[i]).concat([end]);      //Get a route that includes the start, stops and end 
        let fullPath = [];  
        //Generate all of the shortest routes between each of the start/stops/end, and concatenate them onto one big path
        for(let j = 1; j< path.length; j++){
            fullPath = fullPath.concat(route(path[j-1], path[j], map));
        }
        //Add that full path to the list of all possible full paths
        fullPaths.push(fullPath);
    }

    //Find the shortest path of all the full candidate paths to be our shortest path through all points
    let shortestFullPath = [];
    shortestFullPath[map.length * map[0].length] = true;
    for(let i = 0; i < fullPaths.length; i++) {
        if(shortestFullPath == undefined || fullPaths[i].length < shortestFullPath.length) shortestFullPath = fullPaths[i];
    }
    
    //Return full path with the ending point added onto it
    return shortestFullPath.concat([end]);
}

