import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import styled from '@emotion/styled';
import { connect } from 'react-redux';
import Spinner from '@atlaskit/spinner';
import Button from '@atlaskit/button';
import { AutoDismissFlag, FlagGroup } from '@atlaskit/flag';
import Warning from '@atlaskit/icon/glyph/warning';
import { colors } from '@atlaskit/theme';

import TopBar from './components/TopBar';
import Footer from './components/Footer';
import RepositoriesList from './components/RepositoriesList';
import EmptyState from './components/EmptyState';
import { loadRepositories } from './reducer';

import { changeLanguage, changePeriod } from './reducer';
import { findPeriod } from './helpers/github';

const App = ({
  isLoading,
  isLoaded,
  error,
  repositories,
  fetchAll,
  onChangeLanguage,
  selectedLanguage,
  onChangePeriod,
  selectedPeriod,
}) => {
  const [flags, setFlags] = useState([]);

  const dismissError = () => {
    setFlags([]);
  };

  const fetchRepositories = () => {
    fetchAll({
      language: selectedLanguage.value,
      since: selectedPeriod.value,
    });
    dismissError();
  };

  useEffect(() => {
    fetchRepositories();
  }, []);

  useEffect(() => {
    const displayError = () => {
      setFlags([
        {
          id: 'NETWORK_ERROR',
          appearance: 'warning',
          icon: <Warning label="Warning icon" secondaryColor={colors.Y200} />,
          title: (
            <span>
              Error loading content
              {!isLoading ? (
                <Button appearance="link" onClick={fetchRepositories}>
                  Refresh
                </Button>
              ) : null}
            </span>
          ),
        },
      ]);
    };

    if (error) {
      displayError();
    } else {
      dismissError();
    }
  }, [error]);

  const isEmptyRepo = !repositories || repositories.length === 0;

  const shouldShowEmptyState = isLoaded && !isLoading && isEmptyRepo;

  const shouldShowSpinner =
    (isLoaded && isLoading) || (!isLoaded && isEmptyRepo && isLoading);

  return (
    <Container>
      <FlagGroup onDismissed={dismissError}>
        {flags.map(flag => (
          <AutoDismissFlag key={flag.id} {...flag} />
        ))}
      </FlagGroup>
      <TopBarContainer>
        <TopBar
          isLoading={isLoading}
          onChangeLanguage={onChangeLanguage}
          selectedLanguage={selectedLanguage}
          repositories={repositories}
          onChangePeriod={onChangePeriod}
          selectedPeriod={selectedPeriod}
        />
      </TopBarContainer>
      <ListContainer>
        {shouldShowEmptyState ? (
          <EmptyState />
        ) : (
          <RepositoriesList
            repositories={repositories}
            currentPeriod={selectedPeriod.value}
          />
        )}
      </ListContainer>
      <Footer />
      {shouldShowSpinner ? (
        <SpinnerContainer>
          <Spinner size="large" />
        </SpinnerContainer>
      ) : null}
    </Container>
  );
};

App.propTypes = {
  repositories: PropTypes.array,
  selectedLanguage: PropTypes.shape({
    value: PropTypes.string,
    label: PropTypes.string,
  }),
  fetchAll: PropTypes.func.isRequired,
  isLoading: PropTypes.bool,
};

const mapStateToProps = state => ({
  repositories: state.repositories,
  isLoading: state.isLoading,
  isLoaded: state.isLoaded,
  error: state.error,
  selectedLanguage: state.selectedLanguage,
  selectedPeriod: findPeriod(state.selectedPeriod),
});

const mapDispatchToProps = dispatch => ({
  fetchAll: params => dispatch(loadRepositories(params)),
  onChangeLanguage: lang => dispatch(changeLanguage(lang)),
  onChangePeriod: period => dispatch(changePeriod(period.value)),
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(App);

const Container = styled.div`
  background-color: #eee;
  position: relative;
  padding-top: 56px;
  min-height: 100vh;
  text-rendering: optimizeLegibility;
  -webkit-font-smoothing: antialiased;
`;

const TopBarContainer = styled.div`
  position: fixed;
  box-sizing: border-box;
  top: 0;
  width: 100%;
  z-index: 20;
`;

const ListContainer = styled.div`
  position: relative;
  padding: 16px;
  max-width: 1366px;
  margin: auto;
  min-height: calc(100vh - 116px - 56px);
`;

const SpinnerContainer = styled.div`
  position: fixed;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgba(255, 255, 255, 0.6);
`;
