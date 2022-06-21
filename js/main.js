const graphhopperAPI = '90827c9d-80ff-4c73-9e12-f26f3862106e';
var osmUrl = 'http://{s}.tile.osm.org/{z}/{x}/{y}.png',
    osmAttrib = '&copy; <a href="http://openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    osm = L.tileLayer(osmUrl, {
        maxZoom: 18,
        attribution: osmAttrib
    });

let isMobile = false; //initiate as false
// device detection
if (/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|ipad|iris|kindle|Android|Silk|lge |maemo|midp|mmp|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows (ce|phone)|xda|xiino/i.test(navigator.userAgent) ||
    /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(navigator.userAgent.substr(0, 4))) {
    isMobile = true;
}

const type = 'KM';
let coords = L.latLng(56.5033914, 21.0085047);
let distance;
let showOnly = true;
let gType = 'KM';
let selectedRoute;
const nearby = [];
let routeIds = 0;
let running = false;
let selected = L.layerGroup();
let routes = L.layerGroup();

// initialize the map on the "map" div with a given center and zoom
var map = L.map('map').setView(coords, 12).addLayer(osm);
map.addLayer(selected);
map.addLayer(routes)

function makeClick() {
    if (!distance) {
        makeDistance();
    }
    toggleGoButton(true);
    selectedRoute = null;
    routes.clearLayers();
    selected.clearLayers();
    const circle = L.circle(coords, distance / 2, {
        color: 'blue',
        fillOpacity: .2
    });
    map.fitBounds(circle.getBounds());

    generatePath();
}

map.on('click', (e) => {
    if (showOnly) {
        return;
    }
    showOnly = true;
    coords = e.latlng;
    makeClick();
});

function setKM() {
    const km = document.getElementById('KMSelect');
    const value = km.options[km.selectedIndex].value;
    distance = value * 1000;
}

function setHour() {
    const hour = document.getElementById('HSelect');
    const value = hour.options[hour.selectedIndex].value;
    distance = 5 * value * 1000;
}

function changeType() {
    const typeButton = document.getElementById('typeButton');
    const type = typeButton.innerHTML;
    gType = type;
    typeButton.innerHTML = type === 'KM' ? 'H' : 'KM';
    const formKM = document.getElementById('formKM');
    const formH = document.getElementById('formH');

    formKM.classList.toggle('hidden');
    formH.classList.toggle('hidden');
}

function showPosition(position) {
    const {
        coords: {
            latitude,
            longitude
        }
    } = position;
    coords = L.latLng(latitude, longitude);
    showMap();
    makeClick();
};

function errorCallback(error) {
    if (error.code == error.PERMISSION_DENIED) {
        showChooseButton();
        const x = document.getElementById('error');
        x.innerHTML = "Location denied by user";
    }
}

function getLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(showPosition, errorCallback);
    } else {
        showChooseButton();
        const x = document.getElementById('error');
        x.innerHTML = "Geolocation is not supported by this browser.";
    }
}

function sendLocation() {
    getLocation();
}

function toggleMap(status) {
    const docMap = document.getElementById('mapParent');

    docMap.classList.toggle("closedMap", status);
}

function letClickOnMap() {
    showMap();
    showOnly = false;
}

function showMap() {
    const form = document.getElementById('parametr_div');
    const buttons = document.getElementById('ChooseButton');
    const mapButtons = document.getElementById('mapButtons');
    toggleMap(false);

    form.style.height = 0;
    buttons.style.display = 'none';
    mapButtons.style.height = 'auto';
}

function showSettings() {
    toggleMap(true);
    showChooseButton();
    const form = document.getElementById('parametr_div');
    form.style.height = 'initial';
}

function showChooseButton() {
    const buttons = document.getElementById('ChooseButton');
    buttons.style.display = 'block';
}

function getHeight(point) {
    return 10;
}

function addToLat({
    lat
}, distance) {
    const earth = 6378.137, //radius of the earth in kilometer
        pi = Math.PI,
        m = (1 / ((2 * pi / 360) * earth)) / 1000; //1 meter in degree
    return lat + (distance * m);
}

function addToLon({
    lat,
    lng
}, distance) {
    const earth = 6378.137, //radius of the earth in kilometer
        pi = Math.PI,
        m = (1 / ((2 * pi / 360) * earth)) / 1000; //1 meter in degree

    return lng + (distance * m) / Math.cos(lat * (pi / 180));
}

function getBox(point, distance) {
    const earth = 6378.137, //radius of the earth in kilometer
        pi = Math.PI,
        m = (1 / ((2 * pi / 360) * earth)) / 1000; //1 meter in degree

    const new_lat = addToLat(point, distance);
    const new_lon = addToLon(point, distance);
    const new_low_lat = addToLat(point, -distance);
    const new_low_lon = addToLon(point, -distance);

    return `${new_low_lat}, ${new_low_lon}, ${new_lat}, ${new_lon}`;
}

function addToLatLon(point, latLon) {
    const {
        lat,
        lng
    } = latLon;
    const new_lat = addToLat(point, lat);
    const new_lon = addToLon(point, lng);

    return L.latLng(new_lat, new_lon);
}

function findNearPoint(point, radius) {
    let near;
    let closestDistance = 0;

    nearby.forEach(({
        point: tempPoint
    }) => {
        const {
            lat,
            lng
        } = tempPoint;
        const tempDistance = L.latLng(lat, lng).distanceTo(point);
        if (tempDistance < radius && tempDistance > closestDistance) {
            closestDistance = tempDistance;
            near = tempPoint;
        }
    })
    return near;
}

function getNearestPoint(point, nearby = nearby) {
    let shortestDistance = distance;
    let shortestPoint;
    nearby.forEach(({
        point: nearPoint
    }) => {
        const distance = point.distanceTo(nearPoint);
        if (distance < shortestDistance && distance > 1) {
            shortestDistance = distance;
            shortestPoint = nearPoint;
        }
    });

    return shortestPoint;
}

function getNearestPointToStart(degree) {
    let searchRadius = 2;
    let totalLength = searchRadius;
    let nearestPoint;
    let searchPoint = addToLatLon(coords, L.latLng(1, 1), {
        color: '#1f0000'
    });
    while (!nearestPoint) {
        const newLatLon = getPointWithDegrees(degree, searchRadius);
        searchPoint = addToLatLon(searchPoint, newLatLon);

        nearestPoint = findNearPoint(searchPoint, searchRadius);

        if (nearestPoint || totalLength > distance) {
            break;
        }
        totalLength += searchRadius;
        searchRadius = searchRadius * 2.5;
    }

    return nearestPoint;
}

function compareFloats(float1, float2) {
    const roundSize = 10000000;

    const equal = Math.floor(float1 * roundSize) === Math.floor(float2 * roundSize);

    return equal;
}

function getPointWithDegrees(degree, length) {
    const searchAngle = degree % 90;
    let lat = length * Math.cos(searchAngle * (Math.PI / 180));
    let lon = length * Math.sin(searchAngle * (Math.PI / 180));

    if (degree > 90 && degree < 180) {
        lat = -lat;
    }

    if (degree > 180 && degree < 270) {
        lat = -lat;
        lon = -lon;
    }

    if (degree > 270) {
        lon = -lon;
    }

    return L.latLng(lat, lon);
}

function toRad(degree) {
    return degree * (180 / Math.PI);
}

function isInParabola(degree, y, x) {
    const perDegree = 6.28 / 360;
    const rad = -(perDegree * degree);
    const size = 2;
    return (-x * Math.sin(rad) + y * Math.cos(rad)) < (size * Math.pow(x * Math.cos(rad) + y * Math.sin(rad), 2));
}

function filterByPosition(degree, oldPoint, filteredPoints = nearby) {
    const {
        lat: oLat,
        lng: oLng
    } = oldPoint;
    const newFilters = filteredPoints.filter((fPoint) => {
        const {
            point: {
                lat,
                lng
            }
        } = fPoint;

        const dLat = oLat - lat;
        const dLng = oLng - lng;

        return isInParabola(degree, dLat, dLng);
    });

    return newFilters;
}

function makePath(startPoint) {
    let length = 0;
    let filteredPoints = nearby;
    const {
        point,
        degree
    } = startPoint;
    const line = [point];

    const endOffset = getPointWithDegrees(degree, distance);
    const endPoint = addToLatLon(coords, endOffset);

    do {
        const oldPoint = line[line.length - 1];
        filteredPoints = filterByPosition(degree, oldPoint, filteredPoints);
        const newPoint = getNearestPoint(point, filteredPoints) || endPoint;

        line.push(newPoint);
        length += oldPoint.distanceTo(newPoint);
    } while (length < distance * 1.5);

    getRoute(line);
}

function swapCoordinates(coordinates) {
    const newCoords = [];
    coordinates.forEach(coord => {
        const temp = coord[0];
        coord[0] = coord[1];
        coord[1] = temp;
        newCoords.push(coord);
    })

    return newCoords;
}

function getRoute(routeCoords) {
    const type = 'foot';

    const points = routeCoords.reduce((acc, {
        lat,
        lng
    }, index) => {
        const count = Math.floor(distance / 25);
        if (index % count && index !== 1 && index !== routeCoords.length - 1) {
            return acc;
        }
        return `${acc}${index < 1 ? '?' : '&'}point=${lat},${lng}`;
    }, '');

    const url = `https://graphhopper.com/api/1/route${points}&vehicle=${type}&key=${graphhopperAPI}&type=json&points_encoded=false`;

    fetch(url)
        .then(res => res.json())
        .then(({
            paths
        }) => {
            var color;
            const weight = isMobile ? 30 : 18
            const r = Math.floor(Math.random() * 255);
            const g = Math.floor(Math.random() * 128);
            const b = Math.floor(Math.random() * 255);
            color = "rgb(" + r + " ," + g + "," + b + ")";
            const coordinates = swapCoordinates(paths[0].points.coordinates);
            const poly = L.polyline(coordinates, {
                color,
                weight,
                opacity: 1,
                noClip: true,
                id: routeIds,
                lineCap: 'round'
            }).addTo(routes);

            var popup = L.popup({
                className: isMobile ? 'popup-mobile' : 'popup-desktop'
            });

            routeIds++;

            poly.on('click', (e) => {
                if (running) {
                    return;
                }
                selected.clearLayers();
                const latLngs = poly.getLatLngs();
                map.fitBounds(poly.getBounds());

                popup.setLatLng(e.latlng)
                    .setContent('This route has no reviews, yet!')
                    .openOn(map).addTo(selected);

                selectedRoute = L.polyline(latLngs, {
                    weight: weight + 2,
                    color: 'green',
                    opacity: 1
                }).addTo(selected);
                toggleGoButton(false)
            });
        });
}

function toggleGoButton(status = false) {
    const button = document.getElementById('goButton');
    button.disabled = status;
}

function makeDistance() {
    if (gType === 'KM') {
        setKM();
    } else {
        setHour();
    }
}

function showPopUp() {

}

function startRun() {
    const button = document.getElementById('goButton');
    if (running) {
        running = false;
        routes.clearLayers();
        selected.clearLayers();
        button.innerHTML = 'Go!';
        showPopUp();
        selectedRoute = null;
        showChooseButton();


        return;
    }

    if (!selectedRoute) {
        return;
    }

    var greenIcon = new L.Icon({
        iconUrl: 'https://cdn.rawgit.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41]
    });

    var redIcon = new L.Icon({
        iconUrl: 'https://cdn.rawgit.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41]
    });

    button.innerHTML = 'Finish';
    routes.clearLayers();
    selected.clearLayers();
    running = true;
    map.fitBounds(selectedRoute.getBounds());
    const polyRoute = selectedRoute.getLatLngs();
    const start = polyRoute[0];
    const end = polyRoute[polyRoute.length - 1];

    L.marker(start, {
        icon: greenIcon
    }).addTo(routes).bindPopup("Start here!").openPopup().addTo(selected);
    L.marker(end, {
        icon: redIcon
    }).addTo(routes);
    L.polyline(polyRoute, {
        weight: 20,
        color: 'black',
        opacity: 1
    }).addTo(selected);
}

function generatePath() {
    const borderBox = getBox(coords, distance);
    fetch(`https://lz4.overpass-api.de/api/interpreter?data=[out:json][timeout:25];%20(%20way[%22highway%22](${borderBox});%20);%20out%20ids%20geom;`)
        .then(res => res.json())
        .then(({
            elements
        }) => {
            elements.forEach(({
                geometry
            }) => {
                geometry.forEach(({
                    lat,
                    lon
                }) => {
                    const point = L.latLng(lat, lon);
                    if (point.distanceTo(coords) < distance) {
                        nearby.push({
                            point,
                            height: getHeight(point)
                        });
                    };
                });
            });

            const nearest1 = Math.floor(Math.random() * 70) + 1;
            const nearest2 = Math.floor(Math.random() * 160) + 91;
            const nearest3 = Math.floor(Math.random() * 250) + 181;
            const nearest4 = Math.floor(Math.random() * 340) + 271;

            const foundPoints = [{
                    point: getNearestPointToStart(nearest1),
                    degree: nearest1
                },
                {
                    point: getNearestPointToStart(nearest2),
                    degree: nearest2
                },
                {
                    point: getNearestPointToStart(nearest3),
                    degree: nearest3
                },
                {
                    point: getNearestPointToStart(nearest4),
                    degree: nearest4
                },
            ];


            foundPoints.forEach((point) => {
                makePath(point);
            })
        });
}