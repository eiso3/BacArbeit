export const getChatResponse = async (content, modelName) => {
    const response = await fetch('http://localhost:3001/chat', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'x-model-name': modelName,
        },
        body: JSON.stringify({
            prompt: content
        }),
    });

    const data = await response.json();
    if (data) {
        return data.response;
    } else {
        console.error('Error: data.message is undefined');
        return null;
    }
};

export const getChatResponseImage = async (content, modelName, image) => {
    const response = await fetch('http://localhost:3001/chat-image', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'x-model-name': modelName,
        },
        body: JSON.stringify({
            prompt: content,
            image: [image]
        }),
    });

    const data = await response.json();
    if (data) {
        return data.response;
    } else {
        console.error('Error: data.message is undefined');
        return null;
    }

}

export const createModel = async (modelName, modelFile) => {
    const response = await fetch('http://localhost:3001/create-model', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            model: modelName,
            modelfile: modelFile
        }),
    });

    const data = await response.json();
    if (data.status === 'success') {
        console.log('Model created successfully');
    } else {
        console.error('Error creating model:', data.message);
    }
};

export const getVisualisationsTags = async () => {
    const filename = 'taggedVisualisations';
    const response = await fetch(`http://localhost:3001/read-response/${filename}`);
    const data = await response.json();
    if (data) {
        return data.data;
    } else {
        console.error('Error: data.message is undefined');
        return null;
    }
}

export const getDescription = async () => {
    const filename = 'descriptionVisualisations';
    const response = await fetch(`http://localhost:3001/read-response/${filename}`);
    const data = await response.json();
    if (data) {
        return data.data;
    } else {
        console.error('Error: data.message is undefined');
        return null;
    }

}

export const saveVisualisationsTags = async (data) => {
    fetch('http://localhost:3001/save-response', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ response: data, file: 'taggedVisualisations.json' }),
    })
        .then(res => res.json())
        .then(data => console.log(data.message))
        .catch(err => console.error(err));
}

export const saveDescription = async (data) => {
    fetch('http://localhost:3001/save-response', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ response: data, file: 'descriptionVisualisations.json' }),
    })
        .then(res => res.json())
        .then(data => console.log(data.message))
        .catch(err => console.error(err));
}