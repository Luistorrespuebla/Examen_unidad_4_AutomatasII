document.addEventListener('DOMContentLoaded', () => {
    const botonConvertir = document.getElementById('boton-convertir');
    const botonCopiar = document.getElementById('boton-copiar');
    const botonLimpiar = document.getElementById('boton-limpiar');

    botonConvertir?.addEventListener('click', () => {
        const entradaJs = document.getElementById('entrada-js')?.value;
        !entradaJs
            ? mostrarError('Por favor, introduce código JavaScript para convertir.')
            : procesarConversion(entradaJs);
    });

    botonCopiar?.addEventListener('click', () => {
        const salidaTextarea = document.getElementById('salida-python');
        if (salidaTextarea?.value) {
            navigator.clipboard.writeText(salidaTextarea.value)
                .then(() => mostrarExito('Código copiado al portapapeles.'))
                .catch(() => mostrarError('Error al copiar el código.'));
        } else {
            mostrarError('No hay código para copiar.');
        }
    });

    botonLimpiar?.addEventListener('click', () => {
        const entradaTextarea = document.getElementById('entrada-js');
        const salidaTextarea = document.getElementById('salida-python');
        if (entradaTextarea) entradaTextarea.value = '';
        if (salidaTextarea) salidaTextarea.value = '';
        mostrarExito('Campos limpiados.');
    });
});

const procesarConversion = (entradaJs) => {
    const metodosNoCompatibles = detectarMetodosNoCompatibles(entradaJs);
    metodosNoCompatibles.length > 0
        ? mostrarAlertaIncompatibles(metodosNoCompatibles)
        : mostrarSalidaPython(convertirJsAPython(entradaJs));
};

const mostrarSalidaPython = (salidaPython) => {
    const salidaTextarea = document.getElementById('salida-python');
    salidaTextarea
        ? (salidaTextarea.value = salidaPython)
        : mostrarError('No se encontró el área de salida para el código Python.');
};

const detectarMetodosNoCompatibles = (codigoJs) => {
    const metodosNoCompatibles = [
        "document.getElementById", "document.querySelector", "document.querySelectorAll",
        "document.createElement", "element.appendChild", "element.innerHTML",
        "element.value", "element.style", "window.alert", "addEventListener", "removeEventListener",
        "window.location"
    ];
    return metodosNoCompatibles.filter((metodo) => new RegExp(`\\b${metodo}\\b`, 'g').test(codigoJs));
};

const mostrarAlertaIncompatibles = (metodos) =>
    Swal.fire({
        icon: 'warning',
        title: 'Métodos no compatibles detectados',
        text: `Los siguientes métodos no tienen un equivalente directo en Python: ${metodos.join(', ')}`,
        confirmButtonText: 'Entendido'
    });

const mostrarError = (mensaje) =>
    Swal.fire({
        icon: 'error',
        title: 'Error',
        text: mensaje,
        confirmButtonText: 'OK'
    });

const convertirJsAPython = (codigoJs) => {
    const conversiones = [
        { regex: /console\.log\((.+?)\);?/g, reemplazo: 'print($1)' },

        { regex: /\b(let|const|var)\s+([a-zA-Z_$][\w$]*)\s*=\s*(.+?);?/g, reemplazo: '$2 = $3' },

        { regex: /function\s+([a-zA-Z_$][\w$]*)\s*\((.*?)\)\s*\{/g, reemplazo: 'def $1($2):' },

        { regex: /\.toUpperCase\(\)/g, reemplazo: '.upper()' },
        { regex: /\.toLowerCase\(\)/g, reemplazo: '.lower()' },
        { regex: /\.trim\(\)/g, reemplazo: '.strip()' },
        { regex: /\.includes\((.+?)\)/g, reemplazo: 'in $1' },
        { regex: /\.length/g, reemplazo: 'len' },

        { regex: /\.push\((.+?)\)/g, reemplazo: '.append($1)' },
        { regex: /\.pop\(\)/g, reemplazo: '.pop()' },
        { regex: /\.shift\(\)/g, reemplazo: '.pop(0)' },
        { regex: /\.unshift\((.+?)\)/g, reemplazo: '.insert(0, $1)' },
        { regex: /\.forEach\((.+?)\)/g, reemplazo: 'for $1 in ' },

        { regex: /Object\.keys\((.+?)\)/g, reemplazo: '$1.keys()' },
        { regex: /Object\.values\((.+?)\)/g, reemplazo: '$1.values()' },
        { regex: /Object\.entries\((.+?)\)/g, reemplazo: '$1.items()' },

        { regex: /===/g, reemplazo: '==' },
        { regex: /!==/g, reemplazo: '!=' },

        {
            regex: /for\s*\(\s*let\s+([a-zA-Z_$][\w$]*)\s*=\s*(\d+);\s*\1\s*<\s*(\d+);\s*\1\+\+\s*\)\s*\{/g,
            reemplazo: 'for $1 in range($2, $3):'
        },
        {
            regex: /if\s*\((.+?)\)\s*\{/g,
            reemplazo: 'if $1:'
        },
        {
            regex: /else\s*if\s*\((.+?)\)\s*\{/g,
            reemplazo: 'elif $1:'
        },
        {
            regex: /else\s*\{/g,
            reemplazo: 'else:'
        },
        
        { regex: /\{/g, reemplazo: '' },
        { regex: /\}/g, reemplazo: '' },
        { regex: /;$/gm, reemplazo: '' }
    ];
    return conversiones
        .reduce((codigo, { regex, reemplazo }) => codigo.replace(regex, reemplazo), codigoJs)
        .split('\n')
        .map((linea) => linea.trimStart())
        .join('\n');
};

