import { useEffect, useState } from 'react'

export const useOrientation = () => {
	const [type, setType] = useState(window.screen.orientation.type);
	const [angle, setAngle] = useState(window.screen.orientation.angle);

  useEffect(() => {
		window.screen.orientation.onchange = () => {
			console.log(`Event 'orientationchange': ${window.screen.orientation.type} ${window.screen.orientation.angle}`);
			setType(window.screen.orientation.type);
			setAngle(window.screen.orientation.angle);
		}

    return () => {
      window.screen.orientation.onchange = null
    }
  }, [type, angle])

  return { type, angle };
}
