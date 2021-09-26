// eslint-disable-next-line
const order = {
    couriers:{
        free:[],
        returning:[],
        assigned:[]
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
// eslint-disable-next-line
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
// eslint-disable-next-line
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
// eslint-disable-next-line
const underwayOrder = {
    assignee: "",
    order:baseOrder
}

exports.order = order