// --- PC component catalog ---
// Stores each computer part's model file and the text shown in the UI so the viewer can swap
// between components and update the description panel consistently.
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
	},
	{
		file: 'models/CHICKEN.glb',
		name: 'Easter Egg Chicken',
		description: 'Just a random 3D chicken floating in cyberspace. A placeholder for a future PC component.'
	}
];

let i = 0;
const loader = new THREE.GLTFLoader();

// --- 3D component viewer setup ---
// Builds the scene, camera, renderer, lighting, and orbit controls used to inspect each model in the
// component viewer area.

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


	const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 1000);
	camera.position.set(0, 2, 5);

	const renderer = new THREE.WebGLRenderer({ antialias: true });
	renderer.setPixelRatio(window.devicePixelRatio);
	container.appendChild(renderer.domElement);

	function resize() {
		const width = container.clientWidth;
		const height = container.clientHeight;

		if (!width || !height) return;

		camera.aspect = width / height;
		camera.updateProjectionMatrix();
		renderer.setSize(width, height, false);
	}

	const resizeObserver = new ResizeObserver(resize);
	resizeObserver.observe(container);
	resize();

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

	// --- Model loading and positioning logic ---
	// Removes the previous mesh, loads the selected model, scales it to fit the viewport, and centers it
	// before adding it to the scene for display.
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

// --- Animation loop ---
// Keeps the viewer continuously rendering so the orbit controls and any auto-rotation remain smooth.
function animate() {
	requestAnimationFrame(animate);
	componentViewer.render();
}
animate();

// --- Component selection and text updates ---
// Reads the currently selected PC part, updates the title/description text, and tells the viewer to show it.
function loadModelData(index) {
	const partData = pcParts[index];
	if (!partData) return;

	document.getElementById('text-comp-name').innerText = partData.name;
	document.getElementById('text-comp-desc').innerText = partData.description;
	componentViewer.load(partData);
}

// --- Component navigation controls ---
// Moves the selected part index forward or backward while keeping it within the valid range.
function change(n) {
	i += n;

	if (i >= pcParts.length) i = pcParts.length - 1;
	if (i < 0) i = 0;

	loadModelData(i);
}

// --- Navigation line positioning ---
// Keeps the top navigation indicator aligned with the section border after layout or scroll changes.
function alignNavLine() {
	const nav = document.getElementById('nav-border');
	const line = document.getElementById('nav-line');

	if (nav && line) {
		const rect = nav.getBoundingClientRect();
		line.style.top = (rect.bottom + window.scrollY) + 'px';
	}
}

// --- Hazard video switching ---
// Resets all hazard clips before showing the selected one.
function resetHazardVideos() {
	['water', 'dust', 'static'].forEach(name => {
		const video = document.getElementById('hazard-' + name);
		const container = document.getElementById('hazard-' + name + '-container');

		if (video) {
			video.pause();
			if (video.readyState > 0) video.currentTime = 0;
		}
		if (container) container.classList.add('hidden');
	});
}

function showVideo(hazard) {
	const video = document.getElementById('hazard-' + hazard);
	const container = document.getElementById('hazard-' + hazard + '-container');

	if (!video || !container) return;

	resetHazardVideos();

	container.classList.remove('hidden');
	video.play().catch(error => {
		console.error('Unable to play the ' + hazard + ' hazard video:', error);
	});
}

// --- Section transition behavior ---
// Hides the current panel, activates the selected section, and refreshes the current component state.
function transitionTo(btnElement, targetSection) {
	resetHazardVideos();

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
	const navButtons = document.getElementById('nav-butttons')
	const hazardButtons = document.getElementById('hazard-buttons');

	if (pageUi) pageUi.classList.add('fade-out');
	if (darkOverlay) darkOverlay.classList.add('active');
	if (componentsSection) componentsSection.classList.add('hidden');
	if (descriptions) descriptions.classList.add('hidden');
	if (assemblySection) assemblySection.classList.add('hidden');
	if (hazardsSection) hazardsSection.classList.add('hidden');
	if (navButtons) navButtons.classList.add('active');
	if (hazardButtons) hazardButtons.classList.add('hidden');
	
	

		
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


// --- Home reset logic ---
// Restores the default landing state by removing the active section styling and hiding all content groups.
function resetToHome() {
	resetHazardVideos();

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

// --- UI event wiring ---
// Connects navigation buttons, part-changing controls, hazard selectors, and window events to the behavior
// implemented above so the page responds to user interaction and layout changes.
document.querySelectorAll('.nav-btn').forEach(btn => {
	btn.addEventListener('click', () => transitionTo(btn, btn.dataset.section));
});

document.querySelectorAll('[data-change]').forEach(btn => {
	btn.addEventListener('click', () => change(Number(btn.dataset.change)));
});

document.querySelectorAll('[data-hazard="water"], [data-hazard="dust"], [data-hazard="static"]').forEach(button => {
	button.addEventListener('click', () => showVideo(button.dataset.hazard));
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

