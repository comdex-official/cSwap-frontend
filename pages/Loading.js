import {  Spin } from 'antd';

const Loading = () => {
	return (
		<>
			<div className='loading_logo'>
            <Spin size="large" />
			</div>
		</>
	);
};

export default Loading;