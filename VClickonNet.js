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

	// Setup controls with smooth damping and idle auto-rotation
	const controls = new THREE.OrbitControls(camera, renderer.domElement);
	controls.enableDamping = true;
	controls.dampingFactor = 0.05;
	controls.autoRotate = true; // Rotates when idle
	controls.autoRotateSpeed = 2.0; // Adjust idle rotation speed here

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

				const rawModel = gltf.scene;

				// 1. Calculate bounding box of raw geometry
				const box = new THREE.Box3().setFromObject(rawModel);
				const center = box.getCenter(new THREE.Vector3());
				const size = box.getSize(new THREE.Vector3());

				// 2. Offset internal model geometry so its bounding center rests directly at (0, 0, 0)
				rawModel.position.sub(center);

				// 3. Wrap model inside a parent group to enforce a true pivot origin
				const pivotGroup = new THREE.Group();
				pivotGroup.add(rawModel);

				// 4. Scale wrapper group uniformly
				const maxDim = Math.max(size.x, size.y, size.z);
				if (maxDim > 0) {
					const scale = 3 / maxDim;
					pivotGroup.scale.set(scale, scale, scale);
				}

				currentMesh = pivotGroup;
				scene.add(currentMesh);

				// 5. Target camera pivot at world origin
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
		// controls.update handles both physics damping and idle auto-rotation
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
