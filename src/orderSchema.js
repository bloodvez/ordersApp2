const order = {
    couriers:{
        free:[],
        returning:[]
    },
    delivery:{
        pending:[],
        reserved:[],
        underway:[]
    },
    picking:{
        pending:[],
        underway:[]
    },
    unpicking:{
        pending:[],
        underway:[]
    }
}

const baseOrder = {
    orderId: "",
    deliveryDestination: "",
    acceptedDate: "",
    dueDate: "",
    itemsTotal: 9,
    packagesTotal: 0,
    boxLabels: [],
    oversizeItemsTotal: 0,
    badges: []
}

const pendingOrder = {
    orderId: "",
    deliveryDestination: "",
    acceptedDate: "",
    dueDate: "",
    itemsTotal: 0,
    packagesTotal: 0,
    boxLabels: [],
    oversizeItemsTotal: 0,
    badges: []
}

const underwayOrder = {
    assignee: "",
    order:baseOrder
}

exports.order = order