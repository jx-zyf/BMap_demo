import React from 'react';
import { connect } from 'dva';
import MyMap from '../components/myMap';

import styles from './IndexPage.less';

function IndexPage(props) {
  const mapProps = {
    ...props
  }
  return (
    <MyMap {...mapProps} />
  );
}

function mapStateToProps({ map }) {
	return { map };
}
export default connect(mapStateToProps)(IndexPage);
