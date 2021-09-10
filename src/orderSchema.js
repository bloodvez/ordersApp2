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

exports.order = order