import './style.css'
import * as THREE from 'three';
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import * as CANNON from 'cannon-es'
import CannonDebugger from 'cannon-es-debugger'

const pointsUI = document.querySelector("#points");
let points = 0;
let gameover=false;
const randomRangeNum=(max,min)=>{
	return Math.floor(Math.random() * (max-min+1)+min);
};

const moveObstacles=(arr,speed,maxX,minX,maxZ,minZ)=>{
	arr.forEach((el) => {
		el.body.position.z +=speed;
		if(el.body.position.z>camera.position.z){
			el.body.position.x=randomRangeNum=(maxX,minX);
			el.body.position.z=randomRangeNum=(maxZ,minZ);

		}
		el.mesh.position.copy(el.body.position);
		el.mesh.quaternion.copy(el.body.quaternion);
	});
};

const scene =new THREE.Scene();
const world = new CANNON.World({
	gravity:new CANNON.Vec3(0,-9.82,0)
});

const cannonDebugger=new CannonDebugger(scene,world,{
	color:"#AEE2FF",
	scale:1,
});

//const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 4.5;
camera.position.y = 1.5;

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight) ;
document.body.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);

const groundBody = new CANNON.Body({
	shape:new CANNON.Box(new CANNON.Vec3(15,0.5,15)),
});
groundBody.position.y=-1;
world.addBody(groundBody);

const ground = new THREE.Mesh(
	new THREE.BoxGeometry(30, 1, 30), new THREE.MeshBasicMaterial({ color: 0x00ff00 })
);
ground.position.y = -1;
scene.add(ground);

const playerBody=new CANNON.Body({
	mass:1,
	shape:new CANNON.Box(new CANNON.Vec3(0.25,0.25,0.25)),
	fixedRotation:true,
});
world.addBody(playerBody);

const player = new THREE.Mesh(
	new THREE.BoxGeometry(0.5, 0.5, 0.5), 
	new THREE.MeshBasicMaterial({ color: 0xff0000 })
);
scene.add(player);

playerBody.addEventListener("collide",(e)=>{
	powerups.forEach((el)=>{
		if(e.body === el.body)
		el.body.position.x=randomRangeNum(8,-8);
		el.body.position.z=randomRangeNum(-5,-10);
		el.mesh.position.copy=(el.body.position);
		el.mesh.quaternion.copy=(el.body.quaternion);
		points +=1;
		pointsUI.textContent=points.toString();
		}
	});
	enemies.forEach((el)=>{
		if(e.body === el.body){
		gameOver=true;
		}
	});
});



const powerups=[];
for(let i=0;i<10;i++){
	const posX=randomRangeNum(8,-8);
	const posZ=randomRangeNum(-5,-10);

	const powerup = new THREE.Mesh(
	new THREE.TorusGeometry(1, 0.4, 16, 50),
	new THREE.MeshBasicMaterial({ color: 0xffff00 })
	);
powerup.scale.set(0.1,0.1,0.1);
powerup.position.x=posX;
powerup.position.z=posZ;
powerup.name="powerup" + [i+1];
scene.add(powerup);

const powerupBody=new CANNON.Body({
	shape:new CANNON.Sphere(0.2),
});

powerupBody.position.set(posX,0,posZ);
world.addBody(powerupBody);

const powerupObject={
	mesh:powerup,
	body:powerupBody,
};
powerups.push(powerupObject);
}


const enemies=[];
for(let i=0;i<3;i++){
	const posX=randomRangeNum(8,-8);
	const posZ=randomRangeNum(-5,-10);

	const enemy = new THREE.Mesh(
	new THREE.BoxGeometry(1,1,1),
	new THREE.MeshBasicMaterial({ color: 0x0000ff })
	);

enemy.position.x=posX;
enemy.position.z=posZ;
enemy.name="enemy" + [i+1];
scene.add(enemy);

const enemyBody=new CANNON.Body({
	shape:new CANNON.Box(new CANNON.Vec3(0.5,0.5,0.5),
});
enemyBody.position.set(posX,0,posZ);
world.addBody(enemyBody);

const enemyObject = {
	mesh:enemy,
	body:enemyBody,
};
enemies.push(enemyObject);
}

function animate() {
	requestAnimationFrame(animate);

	if(!gameOver){
		moveObstacles(powerups,0.1,8,-8,-5,-10);
		moveObstacles(enemies,0.2,8,-8,-5,-10);
	}
	else{
		pointsUI.textContent="GAME OVER";
		playerBody.velocity.set(playerBody.position.x,5,5);

		enemies.forEach((el) => {
			scene.remove(el.mesh);
			world.removeBody(el.body);
		});
		powerups.forEach((el)=>{
			scene.remove(el.mesh);
			world.removeBody(el.body);
		});
		if(playerBody.position.z >camera.position.z){
			scene.remove(player);
			world.removeBody(playerBody);
		}
	}

	
	controls.update();

	world.fixedStep();

	player.position.copy(playerBody.position);
	player.quaternion.copy(playerBody.quaternion);
	cannonDebugger.update();
	renderer.render(scene, camera);
}

animate();
window.addEventListener("resize",()=> {
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();
	renderer.setSize(window.innerWidth, window.innerHeight);
})

window.addEventListener("keydown", (e) => {
	if (e.key === "d" || e.key === "D" || e.key === "ArrowRight") {
		playerBody.position.x += 0.1;
	}
	if (e.key === "a" || e.key === "A" || e.key === "ArrowLeft") {
		playerBody.position.x -= 0.1;
	}
	if(e.key==="r" || e.key==="R"){
		playerBody.position.x=0;
		playerBody.position.y=0;
		playerBody.position.z=0;
	}
	if(e.key===" "){
		playerBody.position.y=2;
	}
});