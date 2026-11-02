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
		description: 'Provides long-term memory for the PC, storing data for future use.'
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

	if (!container) {
		return {
			load() {},
			render() {}
		};
	}

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
	controls.enablePan = false;
	controls.autoRotate = true;
	controls.autoRotateSpeed = 1.8;

	controls.addEventListener('start', () => {
		controls.autoRotate = false;
	});

	controls.addEventListener('end', () => {
		controls.autoRotate = true;
	});

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
	if (!partData) return;

	document.getElementById('text-comp-name').innerText = partData.name;
	document.getElementById('text-comp-desc').innerText = partData.description;
	componentViewer.load(partData);
}

function change(n) {
	i += n;

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

	if (btnElement) {
		btnElement.classList.add('active-highlight');
	}

	const pageUi = document.getElementById('page-ui');
	const darkOverlay = document.getElementById('dark-overlay');
	const componentsSection = document.getElementById('pc-components-section');
	const descriptions = document.getElementById('descriptions');
	const assemblySection = document.getElementById('pc-assembly-section');
	const hazardsSection = document.getElementById('hazards-section');

	if (pageUi) pageUi.classList.add('fade-out');
	if (darkOverlay) darkOverlay.classList.add('active');

	if (componentsSection) componentsSection.classList.add('hidden');
	if (descriptions) descriptions.classList.add('hidden');
	if (assemblySection) assemblySection.classList.add('hidden');
	if (hazardsSection) hazardsSection.classList.add('hidden');

	if (targetSection === 'components') {
		if (componentsSection) componentsSection.classList.remove('hidden');
		if (descriptions) descriptions.classList.remove('hidden');
	} else if (targetSection === 'assembly') {
		if (assemblySection) assemblySection.classList.remove('hidden');
	} else if (targetSection === 'hazards') {
		if (hazardsSection) hazardsSection.classList.remove('hidden');
	}

	loadModelData(i);
}

function resetToHome() {
	document.querySelectorAll('.nav-btn').forEach(btn => {
		btn.classList.remove('active-highlight');
	});

	const darkOverlay = document.getElementById('dark-overlay');
	const pageUi = document.getElementById('page-ui');
	const componentsSection = document.getElementById('pc-components-section');
	const descriptions = document.getElementById('descriptions');
	const assemblySection = document.getElementById('pc-assembly-section');
	const hazardsSection = document.getElementById('hazards-section');

	if (darkOverlay) darkOverlay.classList.remove('active');
	if (pageUi) pageUi.classList.remove('fade-out');

	if (componentsSection) componentsSection.classList.add('hidden');
	if (descriptions) descriptions.classList.add('hidden');
	if (assemblySection) assemblySection.classList.add('hidden');
	if (hazardsSection) hazardsSection.classList.add('hidden');
}

document.querySelectorAll('.nav-btn').forEach(btn => {
	btn.addEventListener('click', () => transitionTo(btn, btn.dataset.section));
});

document.querySelectorAll('[data-change]').forEach(btn => {
	btn.addEventListener('click', () => change(Number(btn.dataset.change)));
});

const logoBtn = document.querySelector('.logo-btn');
if (logoBtn) {
	logoBtn.addEventListener('click', resetToHome);
}

window.addEventListener('load', () => {
	alignNavLine();
	loadModelData(i);
});

window.addEventListener('resize', alignNavLine);
