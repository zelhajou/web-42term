import WidgetGeneratorClient from './WidgetGeneratorClient';

const WidgetGenerator = ({ widgetType = 'skills-bars' }) => {
  return <WidgetGeneratorClient widgetType={widgetType} />;
};

export default WidgetGenerator;