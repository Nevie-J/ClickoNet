const pcParts = [
	{
		file: 'models/cpu.glb',
		name: 'Central Processing Unit (CPU)',
		description: 'The CPU acts as the brain of the computer, processing instructions, performing calculations, and managing the flow of information through the system.'
	},
	{
		file: 'models/ram.glb',
		name: 'Random Access Memory (RAM)',
		description: 'RAM provides high-speed, short-term memory for the PC, storing data that the CPU needs immediate access to while applications are running.'
	},
	{
		file: 'models/CHICKEN.glb',
		name: 'Easter Egg Chicken',
		description: 'Just a random 3D chicken floating in cyberspace. A placeholder for a future PC component.'
	},
	{
		file: 'models/ssd.glb',
		name: 'Solid State Drive',
		description: 'Provides long-term memory for the pc, storing data for long term use.'
	},
	{
		file: 'models/fan.glb',
		name: 'Fan',
		description: 'Helps cool down the computer system, preventing overheating.'
	},
	{
		file: 'models/motherboard.glb',
		name: 'Motherboard',
		description: 'Connects to every computer component.'
	}
];

let i = 0;

const loader = new THREE.GLTFLoader();

function createModelViewer(containerId) {
	const container = document.getElementById(containerId);
	const scene = new THREE.Scene();
	scene.background = new THREE.Color(0x1a1a1a);
	scene.add(new THREE.GridHelper(10, 10));
	scene.add(new THREE.AxesHelper(5));

	const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 1000);
	camera.position.set(0, 2, 5);

	const renderer = new THREE.WebGLRenderer({ antialias: true });
	renderer.setSize(500, 500);
	renderer.setPixelRatio(window.devicePixelRatio);
	container.appendChild(renderer.domElement);

	scene.add(new THREE.AmbientLight(0xffffff, 0.8));
	scene.add(new THREE.HemisphereLight(0xffffff, 0x444444, 1.5));
	const dirLight = new THREE.DirectionalLight(0xffffff, 1.2);
	dirLight.position.set(5, 10, 7);
	scene.add(dirLight);

	const controls = new THREE.OrbitControls(camera, renderer.domElement);
	controls.enableDamping = true;
	controls.dampingFactor = 0.05;

	let currentMesh = null;
	let loadVersion = 0;

	function load(partData) {
		const version = ++loadVersion;
		if (currentMesh) {
			scene.remove(currentMesh);
			currentMesh = null;
		}

		loader.load(
			partData.file,
			function (gltf) {
				if (version !== loadVersion) return;

				currentMesh = gltf.scene;
				const box = new THREE.Box3().setFromObject(currentMesh);
				const size = box.getSize(new THREE.Vector3());
				const maxDim = Math.max(size.x, size.y, size.z);

				if (maxDim > 0) {
					const scale = 3 / maxDim;
					currentMesh.scale.set(scale, scale, scale);
				}

				currentMesh.updateMatrixWorld(true);
				const center = new THREE.Box3()
					.setFromObject(currentMesh)
					.getCenter(new THREE.Vector3());
				currentMesh.position.sub(center);
				scene.add(currentMesh);

				controls.target.set(0, 0, 0);
				controls.update();
			},
			undefined,
			function (error) {
				console.error('An error occurred loading the model:', error);
			}
		);
	}

	function render() {
		if (currentMesh) currentMesh.rotation.y += 0.005;
		controls.update();
		renderer.render(scene, camera);
	}

	return { load, render };
}

const componentViewer = createModelViewer('3d-container-components');

function animate() {
	requestAnimationFrame(animate);
	componentViewer.render();
}
animate();

function loadModelData(index) {
	const partData = pcParts[index];
	document.getElementById('text-comp-name').innerText = partData.name;
	document.getElementById('text-comp-desc').innerText = partData.description;
	componentViewer.load(partData);
}

function change(n) {
	i = i + n;

	if (i >= pcParts.length) i = pcParts.length - 1;
	if (i < 0) i = 0;

	loadModelData(i);
}

function alignNavLine() {
	const nav = document.getElementById('nav-border');
	const line = document.getElementById('nav-line');
	if (nav && line) {
		const rect = nav.getBoundingClientRect();
		line.style.top = (rect.bottom + window.scrollY) + 'px';
	}
}

function transitionTo(btnElement, targetSection) {
	document.querySelectorAll('.nav-btn').forEach(btn => {
		btn.classList.remove('active-highlight');
	});

	btnElement.classList.add('active-highlight');
	document.getElementById('page-ui').classList.add('fade-out');
	document.getElementById('dark-overlay').classList.add('active');

	document.getElementById('pc-components-section').classList.add('hidden');
	document.getElementById('descriptions').classList.add('hidden');
	document.getElementById('pc-assembly-section').classList.add('hidden');

	if (targetSection === 'components') {
		document.getElementById('pc-components-section').classList.remove('hidden');
		document.getElementById('descriptions').classList.remove('hidden');
	} else if (targetSection === 'assembly') {
		document.getElementById('pc-assembly-section').classList.remove('hidden');
	}

	loadModelData(i);
}

function resetToHome() {
	document.querySelectorAll('.nav-btn').forEach(btn => {
		btn.classList.remove('active-highlight');
	});
	document.getElementById('dark-overlay').classList.remove('active');
	document.getElementById('page-ui').classList.remove('fade-out');

	document.getElementById('pc-components-section').classList.add('hidden');
	document.getElementById('descriptions').classList.add('hidden');
	document.getElementById('pc-assembly-section').classList.add('hidden');
}

document.querySelectorAll('.nav-btn').forEach(btn => {
	btn.addEventListener('click', () => transitionTo(btn, btn.dataset.section));
});

document.querySelectorAll('[data-change]').forEach(btn => {
	btn.addEventListener('click', () => change(Number(btn.dataset.change)));
});

document.querySelector('.logo-btn').addEventListener('click', resetToHome);

window.addEventListener('load', () => {
	alignNavLine();
	loadModelData(i);
});
window.addEventListener('resize', alignNavLine);
