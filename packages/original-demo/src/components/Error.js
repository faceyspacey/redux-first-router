import React from 'react'
import { notFound } from '../css/Switcher'

export default ({ error }) =>
  <div className={notFound}>
    ERROR: {error.message}
  </div>
