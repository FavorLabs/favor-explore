import React, { useEffect, useState } from 'react';
import styles from './index.less';
import { Popover, Button, Modal, Input, message } from 'antd';
import { getFileListMenu, folderResource } from '@/api/api';
import { FolderResource, AllFileInfo, FileListMenu } from '@/declare/api';
import { useSelector, useDispatch } from 'umi';
import { Models } from '@/declare/modelType';
import _ from 'lodash';
import { stopPreventDefault, getSize, attributeCount } from '@/utils/util';
import { Menu, Item, useContextMenu } from 'react-contexify';
import 'react-contexify/dist/ReactContexify.css';
import folderSvg from '@/assets/icon/explore/folderIcon.svg';
import fileSvg from '@/assets/icon/explore/fileIcon.svg';
import moreSvg from '@/assets/icon/explore/more.svg';
import copySvg from '@/assets/icon/explore/copy.svg';
import pasteSvg from '@/assets/icon/explore/paste.svg';
import deleteSvg from '@/assets/icon/explore/delete.svg';
import renameSvg from '@/assets/icon/explore/rename.svg';
import lncPathSvg from '@/assets/icon/explore/lncPath.svg';
import sourceFromSvg from '@/assets/icon/explore/sourceFrom.svg';
import newFolderSvg from '@/assets/icon/explore/newFolder.svg';
import importSvg from '@/assets/icon/explore/import.svg';
import closureSvg from '@/assets/icon/explore/closure.svg';

declare type Props = {
  rootCid: string;
  changeRootCidFn: (cid: string) => void;
  closeMenuFn: () => void;
};

const Folder: React.FC<Props> = (props) => {
  const dispatch = useDispatch();
  const { api } = useSelector((state: Models) => state.global);
  const { copySourceInfo } = useSelector((state: Models) => state.files);
  const [currentFileList, setCurrentFileList] = useState<Object>({});
  const [currentRelativePath, setCurrentRelativePath] = useState('');
  const [currentRelativePathList, setCurrentRelativePathList] = useState<
    string[]
  >([]);
  const [currentSourceInfo, setCurrentSourceInfo] = useState<{
    name: string;
    info: { type: string };
  }>({ name: '', info: { type: '' } });
  // const [currentFolderSourceNum, setCurrentFolderSourceNum] = useState(0);
  const [exploreImportVisiable, setExploreImportVisiable] = useState(false);
  const [newFolderVisiable, setNewFolderVisiable] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [importCid, setImportCid] = useState('');
  const [importPath, setImportPath] = useState('');
  const [quickNavDisplay, setQuickNavDisplay] = useState('none');
  const [renameVisiable, setRenameVisiable] = useState(false);
  const [newSourceName, setNewSourceName] = useState('');

  // const MENU_ID = 'rightMenu';
  // const { show } = useContextMenu({
  //   id: MENU_ID,
  // });

  const pathPrefix = (type: string, rootCid: string) => {
    return api + type + rootCid;
  };

  const changeRootCid = (newRootCid: string) => {
    props.changeRootCidFn(newRootCid);
  };

  const openFile = (fileType: any, fileName: string) => {
    if (fileType === 'file') {
      window.open(
        pathPrefix('/file/', props.rootCid) + currentRelativePath + fileName,
      );
    } else {
      // index
      window.open(pathPrefix('/file/', props.rootCid));
    }
  };

  const setPathInfoByNextPath = (nextPath: string) => {
    const temp = _.cloneDeep(currentRelativePathList);
    temp.push(nextPath);
    setPathList(temp);
  };

  const setPathList = (relativePathList: string[]) => {
    setCurrentRelativePathList(relativePathList);
    setCurrentRelativePath(relativePathList.join(''));
    disposeHeaderNavStyle();
  };

  const disposeHeaderNavStyle = () => {
    const headerLeftDom = document.querySelector(
      '.folder-left-ref',
    ) as HTMLElement;
    const navDom = document.querySelector('.nav-ref') as HTMLElement;
    let navItemDomWidth = 0;
    for (let i = 0; i < navDom.children.length; i++) {
      navItemDomWidth += navDom.children[i].clientWidth;
    }
    if (headerLeftDom.clientWidth > navItemDomWidth) {
      setQuickNavDisplay('none');
    } else {
      setQuickNavDisplay('inline-block');
    }
  };

  const updateFileListInfo = (data: FileListMenu) => {
    if (data?.sub) {
      setCurrentFileList(data.sub);
    } else {
      setCurrentFileList({});
    }
  };

  const getFileListByNextPath = async (nextPath: string) => {
    const { data } = await getFileListMenu(
      pathPrefix('/manifest/', props.rootCid) + currentRelativePath + nextPath,
    );
    updateFileListInfo(data);
    setPathInfoByNextPath(nextPath);
  };

  const updateFileList = async (relativePath: string, newRootCid: string) => {
    const { data } = await getFileListMenu(
      pathPrefix('/manifest/', newRootCid) + relativePath,
    );
    updateFileListInfo(data);
  };

  const jumpPath = async (index: number) => {
    const toRelativePathList = _.cloneDeep(currentRelativePathList).slice(
      0,
      index + 1,
    );
    const { data } = await getFileListMenu(
      pathPrefix('/manifest/', props.rootCid) + toRelativePathList.join(''),
    );
    updateFileListInfo(data);
    setPathList(toRelativePathList);
  };

  const operateFolderResource = async (params: FolderResource) => {
    const { data } = await folderResource(
      pathPrefix('/manifest/', props.rootCid),
      params,
    );
    if (data) {
      changeRootCid(data.reference);
      updateFileList(currentRelativePath, data.reference);
    }
  };

  const operationMenu = () => {
    return (
      <>
        <div className={styles['operation-menu']}>
          <div
            className={styles['menu-item']}
            onClick={() => {
              dispatch({
                type: 'files/setCopySourceInfo',
                payload: {
                  copySourceInfo: {
                    ref: props.rootCid,
                    source:
                      currentRelativePath +
                      currentSourceInfo.name +
                      (currentSourceInfo.info.type === 'directory' ? '/' : ''),
                    details: {
                      name: currentSourceInfo.name,
                      isDirectory:
                        currentSourceInfo.info.type === 'directory'
                          ? true
                          : false,
                    },
                  },
                },
              });
              message.success({
                content: 'Copy source info success!',
                duration: 2,
              });
            }}
          >
            <img src={copySvg} alt="" />
            <Button>Copy source info</Button>
          </div>
          {/* <div className={styles['menu-item']}>
          <img src={pasteSvg} alt="" />
          <Button>Paste</Button>
        </div> */}
          <div
            className={styles['menu-item']}
            onClick={() => {
              operateFolderResource({
                target: currentRelativePath + currentSourceInfo.name,
                op: 0,
              });
            }}
          >
            <img src={deleteSvg} alt="" />
            <Button>Remove</Button>
          </div>
          <div
            className={styles['menu-item']}
            onClick={() => {
              setRenameVisiable(true);
            }}
          >
            <img src={renameSvg} alt="" />
            <Button>Rename</Button>
          </div>
        </div>
      </>
    );
  };

  const importMenu = () => {
    return (
      <>
        <div className={styles['import-menu']}>
          <div
            className={styles['menu-item']}
            onClick={() => {
              setImportCid(copySourceInfo.ref);
              setImportPath(copySourceInfo.source);
              setExploreImportVisiable(true);
            }}
          >
            <img src={sourceFromSvg} alt="" />
            <Button>Explore Path</Button>
          </div>
          <div
            className={styles['menu-item']}
            onClick={() => {
              setNewFolderVisiable(true);
            }}
          >
            <img src={newFolderSvg} alt="" />
            <Button>New Folder</Button>
          </div>
        </div>
      </>
    );
  };

  // useEffect(() => {
  //   console.log('currentRelativePath', currentRelativePath);
  // }, [currentRelativePath]);

  useEffect(() => {
    getFileListByNextPath('/');
  }, []);

  return (
    <>
      <div
        className={styles['content']}
        onContextMenu={(e) => {
          stopPreventDefault(e);
        }}
      >
        <div className={styles['folder-header']}>
          <div className={`${styles['folder-header-left']} folder-left-ref`}>
            <img
              className={styles['folder-header-icon']}
              src={lncPathSvg}
              alt=""
            />
            <span
              className={`${styles['quick-nav']} ${styles['quick-nav-root']}`}
              style={{ display: quickNavDisplay }}
              onClick={(e: React.MouseEvent) => {
                jumpPath(0);
              }}
            >
              {'/'}
            </span>
            <span
              className={`${styles['quick-nav']} ${styles['quick-nav-omit']}`}
              style={{ display: quickNavDisplay }}
              onClick={(e: React.MouseEvent) => {}}
            >
              {'...'}
            </span>
            <div className={`${styles.nav} nav-ref`}>
              {currentRelativePathList.map((value, index) => {
                return (
                  <span
                    key={value + index}
                    className={styles['nav-item']}
                    onClick={(e: React.MouseEvent) => {
                      jumpPath(index);
                    }}
                  >
                    {value.length !== 1
                      ? value.substring(0, value.length - 1)
                      : value}
                  </span>
                );
              })}
            </div>
          </div>
          <div className={styles['folder-header-right']}>
            <Popover
              placement="bottomRight"
              title={null}
              content={importMenu}
              trigger="click"
            >
              {/* <Button className="mainBackground">import</Button> */}
              <img className={styles.import} src={importSvg} alt="import" />
            </Popover>
            <img
              className={styles.close}
              src={closureSvg}
              alt="close"
              onClick={props.closeMenuFn}
            />
          </div>
        </div>
        <div className={styles['folder-content']}>
          {Object.keys(currentFileList).map((key, index) => {
            // @ts-ignore
            const folderInfo = currentFileList[key];
            return (
              <div
                key={key + index}
                className={`${styles['sub-folder']} ${
                  // @ts-ignore
                  styles[currentFileList[key].type]
                }`}
              >
                <div className={styles['sub-folder-left']}>
                  {folderInfo.type === 'directory' ? (
                    <img className={styles.icon} src={folderSvg} alt="" />
                  ) : (
                    <img className={styles.icon} src={fileSvg} alt="" />
                  )}
                  <div
                    className={styles['file-name-hash']}
                    onDoubleClick={() => {
                      if (folderInfo.type === 'directory') {
                        getFileListByNextPath(key + '/');
                      } else {
                        openFile(folderInfo.type, key);
                      }
                    }}
                    onTouchEnd={() => {
                      if (folderInfo.type === 'directory') {
                        getFileListByNextPath(key + '/');
                      } else {
                        openFile(folderInfo.type, key);
                      }
                      // console.log('onTouchEnd');
                    }}
                  >
                    <div className={styles['file-name']}>{key}</div>
                    <div className={styles['file-hash']}>{folderInfo.hash}</div>
                  </div>
                </div>
                <div className={styles['sub-folder-right']}>
                  <span className={styles['file-size']}>
                    {folderInfo?.size ? getSize(folderInfo?.size) : '*'}
                  </span>
                  <Popover
                    placement="bottomRight"
                    title={null}
                    content={operationMenu}
                    trigger="click"
                  >
                    <img
                      className={styles['file-operation']}
                      src={moreSvg}
                      onClick={() => {
                        setCurrentSourceInfo({ name: key, info: folderInfo });
                        // console.log('setCurrentSourceInfo', {
                        //   name: key,
                        //   info: folderInfo,
                        // });
                      }}
                    />
                  </Popover>
                </div>
              </div>
            );
          })}
        </div>
        <Modal
          className={styles['explore-import-modal']}
          maskClosable={false}
          visible={exploreImportVisiable}
          centered
          closable={false}
          destroyOnClose={true}
          onCancel={() => {
            setExploreImportVisiable(false);
          }}
          footer={null}
        >
          <p className={`${styles.title} bold-font`}>import</p>
          <div className={styles.inputs}>
            <Input
              placeholder="Please enter Cid"
              value={importCid}
              onChange={(e) => {
                setImportCid(e.target.value);
              }}
            ></Input>
            <Input
              placeholder="Please enter name or path"
              value={importPath}
              onChange={(e) => {
                setImportPath(e.target.value);
              }}
            ></Input>
          </div>
          <div className={styles.btns}>
            <Button
              className="mainBackground"
              onClick={() => {
                setExploreImportVisiable(false);
              }}
            >
              Cancel
            </Button>
            <Button
              disabled={!(importCid && importPath)}
              className="mainBackground"
              onClick={() => {
                if (importCid && importPath) {
                  operateFolderResource({
                    ref: importCid,
                    source: importPath,
                    target:
                      currentRelativePath +
                      (copySourceInfo.details.isDirectory
                        ? copySourceInfo.details.name + '/'
                        : ''),
                    op: 2,
                  });
                  setExploreImportVisiable(false);
                }
              }}
            >
              Confirm
            </Button>
          </div>
        </Modal>
        <Modal
          className={styles['new-folder-modal']}
          maskClosable={false}
          visible={newFolderVisiable}
          centered
          closable={false}
          destroyOnClose={true}
          onCancel={() => {
            setNewFolderVisiable(false);
          }}
          footer={null}
        >
          <p className={`${styles.title} bold-font`}>New Folder</p>
          <div className={styles.inputs}>
            <Input
              placeholder="Please enter folder name"
              onChange={(e) => {
                setNewFolderName(e.target.value);
              }}
            ></Input>
          </div>
          <div className={styles.btns}>
            <Button
              className="mainBackground"
              onClick={() => {
                setNewFolderVisiable(false);
              }}
            >
              Cancel
            </Button>
            <Button
              className="mainBackground"
              onClick={() => {
                operateFolderResource({
                  target: currentRelativePath + newFolderName + '/',
                  op: 3,
                });
                setNewFolderVisiable(false);
              }}
            >
              Confirm
            </Button>
          </div>
        </Modal>
        <Modal
          className={styles['new-folderName-modal']}
          maskClosable={false}
          visible={renameVisiable}
          centered
          closable={false}
          destroyOnClose={true}
          onCancel={() => {
            setRenameVisiable(false);
          }}
          footer={null}
        >
          <p className={`${styles.title} bold-font`}>Rename</p>
          <div className={styles.inputs}>
            <Input
              placeholder="Please enter name"
              onChange={(e) => {
                setNewSourceName(e.target.value);
              }}
            ></Input>
          </div>
          <div className={styles.btns}>
            <Button
              className="mainBackground"
              onClick={() => {
                setRenameVisiable(false);
              }}
            >
              Cancel
            </Button>
            <Button
              className="mainBackground"
              onClick={() => {
                // console.log({
                //   ref: props.rootCid,
                //   source: currentRelativePath + (currentSourceInfo.info.type === 'directory' ? currentSourceInfo.name + '/' : currentSourceInfo.name),
                //   target: currentRelativePath + (currentSourceInfo.info.type === 'directory' ? newSourceName + '/' : newSourceName),
                //   op: 1,
                // });
                operateFolderResource({
                  ref: props.rootCid,
                  source:
                    currentRelativePath +
                    (currentSourceInfo.info.type === 'directory'
                      ? currentSourceInfo.name + '/'
                      : currentSourceInfo.name),
                  target:
                    currentRelativePath +
                    (currentSourceInfo.info.type === 'directory'
                      ? newSourceName + '/'
                      : newSourceName),
                  op: 1,
                });
                setRenameVisiable(false);
              }}
            >
              Confirm
            </Button>
          </div>
        </Modal>
      </div>
    </>
  );
};

export default Folder;
