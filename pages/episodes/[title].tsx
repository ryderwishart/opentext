/* eslint-disable react/jsx-key */
import { server } from '../../config';
import Link from 'next/link';
import Layout from '../../components/Layout';
import Graph from '../../components/Graph';
import styles from '../../styles/Home.module.css';
import { Button, Drawer, InputNumber, Tag, Tooltip, Slider } from 'antd';
import { getFirstTitleHyphenatedLowerCaseStringFromTitleString } from '../../functions/getFirstTitleHyphenatedLowerCaseStringFromTitleString';
import { getSentenceCaseString } from '../../functions/getSentenceCaseString';
import getSystemFromFeature from '../../functions/getSystemFromFeature';
import { systemsDictionary } from '../../types/systemDefinitions';
import { Episode, GraphEdge, GraphNode } from '../../types';
import { useState } from 'react';

interface EpisodeProps {
  response: {
    currentEpisode: Episode;
    previousEpisode?: Episode;
    nextEpisode?: Episode;
    similarNodes?: GraphNode[];
    similarEdges?: GraphEdge[];
    currentEpisodeMetaData?: {
      title: string;
      start: string;
      section: string;
      mormorphGntId: string;
    };
  };
}

const EpisodePage: React.FC<EpisodeProps> = (props) => {
  const [useGraphLabel, setUseGraphLabel] = useState(false);
  const [isResponsive, setIsResponsive] = useState(null);
  const [edgeStrengthInputValue, setEdgeStrengthInputValue] = useState<number>(
    0.8,
  );
  const [drawerIsVisible, setDrawerIsVisible] = useState(false);
  const currentEpisode = props.response?.currentEpisode;
  if (currentEpisode) {
    const filteredEdges = props.response.similarEdges.filter((similarEdge) => {
      return similarEdge.weight >= edgeStrengthInputValue;
    });

    const filteredNodes = props.response.similarNodes;

    const graphData = {
      links: filteredEdges,
      nodes: props.response.similarNodes,
    };

    const nextTitle = props.response.nextEpisode?.title;
    const previousTitle = props.response.previousEpisode?.title;
    const sharedFeatures =
      Array.isArray(currentEpisode.preTextFeatures) &&
      currentEpisode.preTextFeatures?.filter((feature) =>
        currentEpisode.viaTextFeatures.includes(feature),
      );
    const mutations = [];
    Array.isArray(currentEpisode.preTextFeatures) &&
      currentEpisode.preTextFeatures.forEach(
        (feature) =>
          !currentEpisode.viaTextFeatures.includes(feature) &&
          mutations.push(feature),
      );
    Array.isArray(currentEpisode.viaTextFeatures) &&
      currentEpisode.viaTextFeatures.forEach(
        (feature) =>
          !currentEpisode.preTextFeatures.includes(feature) &&
          mutations.push(feature),
      );

    const episodeStartReferenceArray = props.response.currentEpisodeMetaData?.start.split(
      '.',
    );
    const episodeStartReference =
      episodeStartReferenceArray &&
      `Starts at ${episodeStartReferenceArray[1]} ${episodeStartReferenceArray[2]}:${episodeStartReferenceArray[3]}`;

    return (
      <Layout
        pageTitle={currentEpisode.title}
        pageDescription={`Episode analysis for ${currentEpisode.title}`}
      >
        {episodeStartReference && episodeStartReference}
        {(mutations.length > 0 && (
          <div>
            <h2>Situation Mutations</h2>
            <div>
              <h3>Field</h3>
              {Object.keys(systemsDictionary.field).map((system) => {
                return (
                  <div key={system}>
                    {systemsDictionary.field[system]
                      .filter((feature) => mutations.includes(feature))
                      .filter((mutation) =>
                        currentEpisode.preTextFeatures.includes(mutation),
                      )
                      .map((mutation) => (
                        <span key={mutation}>
                          {mutation}{' '}
                          <span style={{ color: '#1890ff' }}>&rarr;</span>{' '}
                        </span>
                      ))}
                    {systemsDictionary.field[system]
                      .filter((feature) => mutations.includes(feature))
                      .filter((mutation) =>
                        currentEpisode.viaTextFeatures.includes(mutation),
                      )}
                  </div>
                );
              })}
            </div>
            <div>
              <h3>Tenor</h3>
              {Object.keys(systemsDictionary.tenor).map((system) => {
                return (
                  <div>
                    {systemsDictionary.tenor[system]
                      .filter((feature) => mutations.includes(feature))
                      .filter((mutation) =>
                        currentEpisode.preTextFeatures.includes(mutation),
                      )
                      .map((mutation) => (
                        <span>
                          {mutation}{' '}
                          <span style={{ color: '#1890ff' }}>&rarr;</span>{' '}
                        </span>
                      ))}
                    {systemsDictionary.tenor[system]
                      .filter((feature) => mutations.includes(feature))
                      .filter((mutation) =>
                        currentEpisode.viaTextFeatures.includes(mutation),
                      )}
                  </div>
                );
              })}
            </div>
            <div>
              <h3>Mode</h3>
              {Object.keys(systemsDictionary.mode).map((system) => {
                return (
                  <div>
                    {systemsDictionary.mode[system]
                      .filter((feature) => mutations.includes(feature))
                      .filter((mutation) =>
                        currentEpisode.preTextFeatures.includes(mutation),
                      )
                      .map((mutation) => (
                        <span>
                          {mutation}{' '}
                          <span style={{ color: '#1890ff' }}>&rarr;</span>{' '}
                        </span>
                      ))}
                    {systemsDictionary.mode[system]
                      .filter((feature) => mutations.includes(feature))
                      .filter((mutation) =>
                        currentEpisode.viaTextFeatures.includes(mutation),
                      )}
                  </div>
                );
              })}
            </div>
          </div>
        )) || <h2>Non-mutating situation</h2>}
        <div
          style={{ display: 'flex', maxWidth: '90vw', flexDirection: 'row' }}
        >
          <div
            style={{ display: 'flex', flexFlow: 'column', maxWidth: '42vw' }}
          >
            <h2>Pre-text Features</h2>
            {Array.isArray(currentEpisode.preTextFeatures) ? ( // TODO: abstract this entire feature-map
              currentEpisode.preTextFeatures.map((feature) => {
                const featureTruncated =
                  feature.length > 18
                    ? `${feature.slice(0, 10)}...${feature.slice(-10)}`
                    : feature;
                try {
                  const system = getSystemFromFeature(feature);
                  const registerParameter = getSystemFromFeature(feature, true);

                  const highlightColor =
                    registerParameter === 'field'
                      ? 'orange'
                      : registerParameter === 'tenor'
                      ? 'red'
                      : registerParameter === 'mode'
                      ? 'green'
                      : 'grey';
                  if (currentEpisode.viaTextFeatures.includes(feature)) {
                    return (
                      <Tooltip
                        title={getSentenceCaseString(system) + ': ' + feature}
                      >
                        <Tag>{featureTruncated}</Tag>
                      </Tooltip>
                    );
                  } else {
                    return (
                      <Tooltip
                        title={getSentenceCaseString(system) + ': ' + feature}
                      >
                        <Tag color={highlightColor}>{featureTruncated}</Tag>
                      </Tooltip>
                    );
                  }
                } catch (error) {
                  return <Tag>{featureTruncated}</Tag>;
                }
              })
            ) : (
              <Tag>{currentEpisode.preTextFeatures}</Tag>
            )}
          </div>
          <div
            style={{ display: 'flex', flexFlow: 'column', maxWidth: '42vw' }}
          >
            <h2>Via-text Features</h2>
            {Array.isArray(currentEpisode.viaTextFeatures) ? (
              currentEpisode.viaTextFeatures.map((feature) => {
                const featureTruncated =
                  feature.length > 18
                    ? `${feature.slice(0, 10)}...${feature.slice(-10)}`
                    : feature;
                try {
                  const system = getSystemFromFeature(feature);
                  const registerParameter = getSystemFromFeature(feature, true);
                  const highlightColor = // TODO: abstract highlight colour getter
                    registerParameter === 'field'
                      ? 'orange'
                      : registerParameter === 'tenor'
                      ? 'red'
                      : registerParameter === 'mode'
                      ? 'green'
                      : 'grey';
                  if (currentEpisode.preTextFeatures.includes(feature)) {
                    return (
                      <Tooltip
                        title={getSentenceCaseString(system) + ': ' + feature}
                      >
                        <Tag>{featureTruncated}</Tag>
                      </Tooltip>
                    );
                  } else {
                    return (
                      <Tooltip
                        title={getSentenceCaseString(system) + ': ' + feature}
                      >
                        <Tag color={highlightColor}>{featureTruncated}</Tag>
                      </Tooltip>
                    );
                  }
                } catch (error) {
                  return <Tag>{featureTruncated}</Tag>;
                }
              })
            ) : (
              <Tag>{currentEpisode.viaTextFeatures}</Tag>
            )}
          </div>
        </div>
        <Button
          style={{ margin: '20px' }}
          onClick={() => setDrawerIsVisible(drawerIsVisible ? false : true)}
        >
          Open Drawer
        </Button>
        <div className={styles.graph}>
          {typeof window !== 'undefined' && (
            <Graph graphData={graphData} cooldown={50} />
          )}
        </div>
        <ul>
          {graphData.nodes.map((node) => {
            const nodeID = node.id
              .split(' ')
              .filter((idSection) => idSection.includes('§'))
              .join(' ');
            const nodeTitle = node.id
              .split(/[,'".’“”]+/)
              .join('')
              .split(' ')
              .filter((idSection) => !idSection.includes('§'))
              .join(' ');
            const currentEpisodeID = currentEpisode.episode
              .split(' ')
              .filter((idSection) => idSection.includes('§'))
              .join(' ');
            if (!currentEpisodeID.includes(nodeID)) {
              const nodeEpisodeLinkString = getFirstTitleHyphenatedLowerCaseStringFromTitleString(
                { string: nodeTitle },
              );
              const nodeSimilarityToCentralNode = graphData.links.find(
                (edge) => {
                  const edgeIDs = edge.id
                    .split(/[,'".’“”]+/)
                    .join('')
                    .split('-')
                    .join(' ');
                  if (edgeIDs.includes(node.id)) {
                    return edge;
                  }
                },
              )?.size;
              return (
                <li id={node.id}>
                  <Link href={`/episodes/${nodeEpisodeLinkString}`}>
                    <a>
                      {node.label}{' '}
                      <strong>{nodeSimilarityToCentralNode}</strong>
                    </a>
                  </Link>
                </li>
              );
            }
          })}
        </ul>
        <div
          className={styles.grid}
          style={{
            display: 'flex',
            flexFlow: 'row nowrap',
            maxWidth: '90vw',
          }}
        >
          {/* TODO: add keyframes and transition to previous or next episodes? */}
          {/* FIXME: previous and next buttons only increment single-digit changes? Go to index 0 and press 'previous' */}
          {previousTitle && (
            <Link
              href={`/episodes/${getFirstTitleHyphenatedLowerCaseStringFromTitleString(
                {
                  string: previousTitle,
                },
              )}`}
            >
              <a className={styles.card}>&larr; Previous Episode</a>
            </Link>
          )}
          <Link href={`/episodes`}>
            <a className={styles.card}>&darr; Back to all episodes</a>
          </Link>
          {nextTitle && (
            <Link
              href={`/episodes/${getFirstTitleHyphenatedLowerCaseStringFromTitleString(
                {
                  string: nextTitle,
                },
              )}`}
            >
              <a className={styles.card}>Next Episode &rarr;</a>
            </Link>
          )}
        </div>
        <Drawer
          visible={drawerIsVisible}
          onClose={() => setDrawerIsVisible(false)}
        >
          <br />

          {/* <Button
            onClick={() => setUseGraphLabel(useGraphLabel ? false : true)}
          >
            {useGraphLabel ? 'Hide labels' : 'Show labels'}
          </Button> */}
          <Slider
            min={0.8}
            max={1.0}
            step={0.01}
            value={
              typeof edgeStrengthInputValue === 'number'
                ? edgeStrengthInputValue
                : 0
            }
            onChange={(value) => value && setEdgeStrengthInputValue(value)}
          />
          <InputNumber
            defaultValue={edgeStrengthInputValue}
            min={0.8}
            max={1.0}
            step={0.01}
            onChange={(value) => setEdgeStrengthInputValue(value)}
          />
          <div>
            <h4>Nodes</h4>
            {filteredNodes.map((node) => {
              return (
                <div key={node.id}>
                  {node.label}
                  <ul>
                    <li>
                      Average Similarity:{' '}
                      <strong>
                        {parseFloat(node.attributes.average_similarity).toFixed(
                          2,
                        )}
                      </strong>
                    </li>
                    <li>
                      Number of connections:{' '}
                      <strong>{node.attributes.Degree}</strong>
                    </li>
                  </ul>
                </div>
              );
            })}
          </div>
          <div>
            <h4>Links</h4>
            {props.response.similarEdges.map((edge) => {
              return (
                <p>
                  {edge.id} <strong>{edge.weight}</strong>
                </p>
              );
            })}
          </div>
        </Drawer>
      </Layout>
    );
  } else {
    return (
      <Layout>
        <Link href="/episodes">
          <div className={styles.card}>
            <h1>Episode data not found</h1>
            <p>Back to all episodes</p>
          </div>
        </Link>
      </Layout>
    );
  }
};

export default EpisodePage;

export async function getStaticProps(context: { params: { title: string } }) {
  const hasContext = !!(Object.keys(context.params).length > 0);
  if (hasContext) {
    const response = await (
      await fetch(`${server}/api/episodes/${context.params.title}`)
    ).json();
    return {
      props: {
        response,
      },
    };
  } else {
    return {
      props: {},
    };
  }
}

export const getStaticPaths = async () => {
  const response = await (await fetch(`${server}/api/episodes/`)).json();
  const titles = response?.episodes.root.episode.map((episodeContainer) => {
    return getFirstTitleHyphenatedLowerCaseStringFromTitleString({
      string: episodeContainer.$.title,
    });
  });
  const paths = titles?.map((title) => ({
    params: { title: title.toString() },
  }));
  return {
    paths,
    fallback: false,
  };
};
