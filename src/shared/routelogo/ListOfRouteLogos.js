import React from 'react'
import PropTypes from 'prop-types';

import './ListOfRouteLogos.css'
import RouteLogo from "./RouteLogo";
import {Link} from "react-router-dom";


export default function ListOfRouteLogos(props) {
  let routeLogos = [];
  for (const routeId of props.routeIds) {
    if (props.skipExpress && routeId.substr(-1, 1) === 'X') {
      continue
    }
    if (props.addLinks) {
      routeLogos.push(
        <div key={routeId}>
          <Link to={"/routes/" + routeId}>
            <RouteLogo route={routeId}/>
          </Link>
        </div>
      )
    } else {
      routeLogos.push(
        <div key={routeId}>
          <RouteLogo route={routeId}/>
        </div>
      )
    }
  }
  return (

    <div className="ListOfRouteLogos">
      {routeLogos}
    </div>
  )
}

ListOfRouteLogos.Props = {
  routeIds: PropTypes.array,
  skipExpress: PropTypes.bool,
  addLinks: PropTypes.bool
};
