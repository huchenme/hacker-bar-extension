import Popup from './Popup';
import { bindElementToQueries } from 'dom-testing-library';
import { render, fireEvent, cleanup } from 'react-testing-library';

const bodyUtils = bindElementToQueries(document.body);

beforeEach(() => {
  jest.useFakeTimers();
});

afterEach(cleanup);

const PopupDemo = props => (
  <Popup
    content={({ close }) => (
      <div>
        Popup Content
        <button type="button" onClick={close}>
          Close
        </button>
      </div>
    )}
    {...props}
  >
    {({ ref, toggle }) => (
      <button ref={ref} type="button" onClick={toggle}>
        Click Me
      </button>
    )}
  </Popup>
);

function renderPopup(props) {
  return render(<PopupDemo {...props} />);
}

describe('<Popup>', () => {
  describe('Uncontrolled', () => {
    it('Should toggle popup when clicked button', () => {
      const { getByText } = renderPopup();
      expect(bodyUtils.queryByText('Popup Content')).not.toBeInTheDocument();
      fireEvent.click(getByText('Click Me'));
      expect(bodyUtils.queryByText('Popup Content')).toBeInTheDocument();
    });

    it('Should close when click outside', () => {
      const { getByText } = renderPopup();
      fireEvent.click(getByText('Click Me'));
      expect(bodyUtils.queryByText('Popup Content')).toBeInTheDocument();
      fireEvent.mouseUp(document.body);
      expect(bodyUtils.queryByText('Popup Content')).not.toBeInTheDocument();
    });

    it('Should not close when click outside if closeOnOutsideClick is false', () => {
      const { getByText } = renderPopup({ closeOnOutsideClick: false });
      fireEvent.click(getByText('Click Me'));
      expect(bodyUtils.queryByText('Popup Content')).toBeInTheDocument();
      fireEvent.mouseUp(document.body);
      expect(bodyUtils.queryByText('Popup Content')).toBeInTheDocument();
    });

    it('Should close popup when clicked close button', () => {
      const { getByText } = renderPopup();
      fireEvent.click(getByText('Click Me'));
      expect(bodyUtils.queryByText('Popup Content')).toBeInTheDocument();
      fireEvent.click(bodyUtils.getByText('Close'));
      expect(bodyUtils.queryByText('Popup Content')).not.toBeInTheDocument();
    });
  });

  describe('Controlled', () => {
    it('Should toggle popup when clicked button', () => {
      const onToggle = jest.fn();
      const { getByText } = renderPopup({ isOpen: true, onToggle });
      expect(bodyUtils.queryByText('Popup Content')).toBeInTheDocument();
      fireEvent.click(getByText('Click Me'));
      expect(bodyUtils.queryByText('Popup Content')).toBeInTheDocument();
      expect(onToggle).toHaveBeenCalledWith(false);
    });

    it('Should call onOutsideClick when click outside', () => {
      const onOutsideClick = jest.fn();
      renderPopup({ isOpen: true, onOutsideClick });
      expect(bodyUtils.queryByText('Popup Content')).toBeInTheDocument();
      fireEvent.mouseUp(document.body);
      expect(onOutsideClick).toHaveBeenCalled();
      expect(bodyUtils.queryByText('Popup Content')).toBeInTheDocument();
    });

    it('Should close popup when clicked close button', () => {
      const onToggle = jest.fn();
      renderPopup({ isOpen: true, onToggle });
      fireEvent.click(bodyUtils.getByText('Close'));
      expect(onToggle).toHaveBeenCalledWith(false);
    });

    it('Should toggle popup when props is changed', () => {
      const { rerender } = renderPopup({ isOpen: true });
      expect(bodyUtils.queryByText('Popup Content')).toBeInTheDocument();

      rerender(<PopupDemo isOpen={false} />);
      expect(bodyUtils.queryByText('Popup Content')).not.toBeInTheDocument();
    });
  });
});
