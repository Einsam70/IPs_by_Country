document.addEventListener('DOMContentLoaded', function () {
    const selectPais = document.getElementById('selectPais');
    const generarArchivoBtn = document.getElementById('generarArchivoBtn');
    const generarArchivoTxtBtn = document.getElementById('generarArchivoTxtBtn');

    // Llamada para obtener el objeto con los códigos ISO 3166 y nombres de países
    fetch('paises.json') // JSON con los códigos de países y nombres
        .then(response => response.json())
        .then(paises => {
        	// Obtener las claves (códigos de país) y ordenarlas alfabéticamente
        	const codigosOrdenados = Object.keys(paises).sort((a, b) => paises[a].localeCompare(paises[b]));
        	// Llenar el dropdown con los códigos de países y nombres en orden alfabético
        	codigosOrdenados.forEach(codigo => {
        		const option = document.createElement('option');
        		option.value = codigo;
        		option.text = paises[codigo];
        		selectPais.appendChild(option);
        	});
        })
        .catch(error => console.error('Error al obtener la lista de países:', error));

    // Agregar un evento clic al botón
    generarArchivoBtn.addEventListener('click', function () {
        const codigoPaisSeleccionado = selectPais.value;
        const urlserver = 'https://cdn-lite.ip2location.com/datasets';

        // Realizar la llamada al archivo JSON del país seleccionado
        fetch(`${urlserver}/${codigoPaisSeleccionado}.json`)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Error al obtener el archivo JSON para ${codigoPaisSeleccionado}`);
                }
                return response.json();
            })
            .then(jsonData => {
                const data = jsonData.data; // Acceder a la propiedad 'data'
                // Actualizar la tabla con los nuevos datos
            	actualizarTabla(data);
                // Llamar a la función para generar y descargar el archivo CSV
                generarArchivoCSV(data, codigoPaisSeleccionado);
            })
            .catch(error => console.error(error));
    });
    
    // Agregar un evento clic al botón TXT
    generarArchivoTxtBtn.addEventListener('click', function () {
    	const codigoPaisSeleccionado = selectPais.value;
    	const urlserver = 'https://cdn-lite.ip2location.com/datasets';
    	
    	// Realizar la llamada al archivo JSON del país seleccionado
        fetch(`${urlserver}/${codigoPaisSeleccionado}.json`)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Error al obtener el archivo JSON para ${codigoPaisSeleccionado}`);
                }
                return response.json();
            })
            .then(jsonData => {
                const data = jsonData.data;
				// Actualizar la tabla con los nuevos datos
            	actualizarTabla(data);
                // Llamar a la función para generar y descargar el archivo TXT
                generarArchivoTexto(data, codigoPaisSeleccionado);
            })
            .catch(error => console.error(error));
    });
    
});

// Función para generar y descargar el archivo CSV
function generarArchivoCSV(data, codigoPais) {
    // Crear encabezados CSV
    let csvContent = Object.keys(data[0]).join(",") + "\n";

    // Agregar datos al contenido CSV
    data.forEach(registro => {
    	const fila = registro.map(valor => {
    		// Eliminar comas de los números con unidades de millar
            return typeof valor === 'string' ? valor.replace(/,/g, '') : valor;
        });
        
        csvContent += fila.join(",") + "\n";
        
    });

    // Crear un objeto Blob y generar un enlace de descarga
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    
    // Configurar el enlace para descargar el archivo
    a.href = url;
    a.download = `${codigoPais}.csv`;
    
    // Agregar el enlace al documento y hacer clic para iniciar la descarga
    document.body.appendChild(a);
    a.click();

    // Limpiar el objeto Blob y el enlace después de la descarga
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
}

function generarArchivoTexto(data, codigoPais) {
    // Obtener el primer y segundo valor de cada cadena de datos
    const valores = data.map(registro => `${registro[0]}-${registro[1]}`).join("\n");

    // Configurar el enlace para descargar el archivo de texto
    const blob = new Blob([valores], { type: 'text/plain' });

    // Crear un enlace temporal y hacer clic para descargar el archivo
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `${codigoPais}.txt`; // Utiliza el código del país en el nombre del archivo
    a.click();
    // Liberar el objeto URL creado
    URL.revokeObjectURL(a.href);
}

function actualizarTabla(data) {
    const tabla = document.getElementById('miTabla');
    const tbody = tabla.getElementsByTagName('tbody')[0];

    // Limpiar el contenido actual de la tabla
    tbody.innerHTML = '';

    // Iterar a través de los nuevos datos y agregar filas a la tabla
    data.forEach(registro => {
        const fila = document.createElement('tr');

        // Crear celdas y agregarlas a la fila
        registro.forEach(valor => {
            const celda = document.createElement('td');
            celda.textContent = valor;
            fila.appendChild(celda);
        });

        // Agregar la fila al tbody de la tabla
        tbody.appendChild(fila);
    });
}
