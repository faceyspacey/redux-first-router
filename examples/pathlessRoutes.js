// Note: this is just a proof of concept

const routesMap = {
  HOME: '/',  // path only route
  LIST: {     // route object (with a path)
    path: '/list/:slug',
    thunk: async (dispatch, getState) => {
       const { slug } = getState().location.payload
       const response = await fetch(`/api/items/${slug}`)
       const items = await data.json()
       
       dispatch({ type: 'ITEMS_FETCHED', payload: { items } })
    }
  },
  UPDATE_COUNTERS: {    // pathless route (for the purpose of uniform + idiomatic thunks)
    thunk: async (dispatch, getState, { action, extra: { api } }) => {
       const { id } = action.payload
       const counters = await api.fetchCounters(id)

       dispatch({ type: 'COUNTERS_FETCHED', payload: { id, counters } })
    }  
  }
}

//=====================

import api from './api'

connectRoutes(history, routesMap, { extra: api })

/*
HOW THIS WORKS:
When you dispatch type UPDATE_COUNTERS, its corresponding thunk in the routesMap will be called :)
WHAT'S ITS PURPOSE? 
Can't I just use regular middleware. Of course you still can, but if you're primarily using redux-thunk,
it's better to have your async actions (aka "thunks") be uniform. This does that. Now all your thunks 
can look the same.
The URL-centric "contract" of the routesMap in general prevents action explosion (i.e. an explosion in the number 
of actions you have). That makes your app easier to manage. By adding non-URL-centric "routes," it's essentially a 
next step of that goal/benefit. Though the # of actions could explode here too--at least you now have some sort of 
structure guiding you. 
In addition, since RFR thunks implicitly have the initial action dispatched, your actual "thunk"
function is easier--i.e. you don't have to create an async thunk that dispatches a "setup action" to trigger
loading... spinners; you only have to dispatch the "follow-up action" with the data.
Pathless routes are small, but it's a key ingredient in formalizing the vision here, especially when there are so 
many "learners" trying to grok the otherwise complicated Redux approach (especially since most people are still 
coming from OOP).
 Now you're stack is: React, Redux, Redux-First Router (soon to be called "Rudy"). And you and learners and all of us
 have less to think about in terms of javascript fatigue and all the options that have been typical of the React
 community. You can build truly advanced apps via simplified yet powerful idioms, thanks to Rudy. And other coders
 can have a very good idea what's going on in your app, just as they would when looking at a Rails app. Ultimately
 Rudy/RFR really fills a void that the React/NPM style of development hasn't fostered: truly standard idioms/bestPractices.
 So that means you get the best of React/NPM--modularity + choices + ecosystem--and structure where/when you need it.
 
 It's time to win everbody!
